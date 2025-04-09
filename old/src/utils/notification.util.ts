import type { APIEmbed, Client, Guild, TextChannel } from "discord.js";
import { prisma } from "../prisma";
import { Worker } from "worker_threads";
import { Mutex } from "async-mutex";

const notificationQueues: { [key: string]: APIEmbed[] } = {};
const guilds: string[] = [];
const PROCESS_INTERVAL = 5000; // Interval to process notifications (in milliseconds)
const CLEANUP_INTERVAL = 60000; // Interval to clean up empty queues and inactive guilds
const MAX_RETRIES = 3; // Maximum retries for failed tasks
const mutex = new Mutex(); // Mutex for thread-safe access to notificationQueues

// Worker pool implementation
const WORKER_POOL_SIZE = 4;
const workerPool: Worker[] = [];
const taskQueue: (() => void)[] = []; // Task queue for handling busy workers

for (let i = 0; i < WORKER_POOL_SIZE; i++) {
    workerPool.push(new Worker(require.resolve("../notificationWorker")));
}

function getAvailableWorker(): Worker | null {
    return workerPool.length > 0 ? workerPool.shift()! : null;
}

function returnWorkerToPool(worker: Worker) {
    workerPool.push(worker);
    if (taskQueue.length > 0) {
        const nextTask = taskQueue.shift();
        if (nextTask) nextTask();
    }
}

export async function addNotificationToQueue(guild: Guild, embed: APIEmbed) {
    await mutex.runExclusive(() => {
        if (!notificationQueues[guild.id]) {
            notificationQueues[guild.id] = [];
            guilds.push(guild.id);
        }
        notificationQueues[guild.id].push(embed);
    });
}

async function processNotificationsWithWorker(guildId: string, notifications: APIEmbed[], retries = 0): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const worker = getAvailableWorker();
        if (!worker) {
            taskQueue.push(() => processNotificationsWithWorker(guildId, notifications, retries).then(resolve).catch(reject));
            return;
        }

        worker.postMessage({ guildId, notifications });

        worker.on("message", (message) => {
            if (message.status === "success") {
                console.log(`[Worker] Successfully processed notifications for guild ${guildId}`);
                resolve();
            } else {
                console.error(`[Worker] Error processing notifications for guild ${guildId}:`, message.error);
                if (retries < MAX_RETRIES) {
                    console.log(`[Worker] Retrying task for guild ${guildId} (Attempt ${retries + 1})`);
                    processNotificationsWithWorker(guildId, notifications, retries + 1).then(resolve).catch(reject);
                } else {
                    reject(new Error(message.error || "Unknown error in worker"));
                }
            }
        });

        worker.on("error", (error) => {
            console.error(`[Worker] Worker error for guild ${guildId}:`, error);
            if (retries < MAX_RETRIES) {
                console.log(`[Worker] Retrying task for guild ${guildId} (Attempt ${retries + 1})`);
                processNotificationsWithWorker(guildId, notifications, retries + 1).then(resolve).catch(reject);
            } else {
                reject(error);
            }
        });

        worker.on("exit", (code) => {
            if (code !== 0) {
                console.error(`[Worker] Worker exited with code ${code} for guild ${guildId}`);
                if (retries < MAX_RETRIES) {
                    console.log(`[Worker] Retrying task for guild ${guildId} (Attempt ${retries + 1})`);
                    processNotificationsWithWorker(guildId, notifications, retries + 1).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            }
        });

        returnWorkerToPool(worker);
    });
}

async function sendAllNotificationsOfGuild(guildId: string, client: Client) {
    const guildSettings = await prisma.guildSettings.findUnique({ where: { guildId } });
    if (!guildSettings?.infoChannel) {
        console.log(`[Notification] Notification channel is not set for guild ${guildId}`);
        return;
    }

    const notificationChannel = client.channels.cache.get(guildSettings.infoChannel) as TextChannel;
    if (!notificationChannel?.isTextBased()) {
        console.log(`[Notification] Notification channel is invalid or not text-based for guild ${guildId}`);
        return;
    }

    const notifications = await mutex.runExclusive(() => [...(notificationQueues[guildId] || [])]); // Clone the array
    if (notifications.length <= 0) return;

    const chunkSize = 10; // Process notifications in chunks
    for (let i = 0; i < notifications.length; i += chunkSize) {
        const chunk = notifications.slice(i, i + chunkSize); // Use slice to create chunks
        try {
            await notificationChannel.send({ embeds: chunk });
            console.log(`[Notification] Sent ${chunk.length} notifications to guild ${guildId}`);
        } catch (error) {
            console.error(`[Notification] Failed to send notifications to guild ${guildId}:`, error);
        }
    }

    // Clear the processed notifications from the queue
    await mutex.runExclusive(() => {
        notificationQueues[guildId] = notificationQueues[guildId].slice(notifications.length);
    });
}

async function sendAllNotifications(client: Client) {
    await Promise.all(guilds.map((guild) => sendAllNotificationsOfGuild(guild, client)));
}

function cleanUpQueues() {
    mutex.runExclusive(() => {
        for (const guildId of guilds) {
            if (!notificationQueues[guildId] || notificationQueues[guildId].length === 0) {
                delete notificationQueues[guildId];
                const index = guilds.indexOf(guildId);
                if (index !== -1) guilds.splice(index, 1);
                console.log(`[Cleanup] Removed empty queue for guild ${guildId}`);
            }
        }
    });
}

export function startNotificationProcessor(client: Client) {
    setInterval(() => {
        sendAllNotifications(client).catch(console.error);
    }, PROCESS_INTERVAL);

    setInterval(() => {
        cleanUpQueues();
    }, CLEANUP_INTERVAL);
}