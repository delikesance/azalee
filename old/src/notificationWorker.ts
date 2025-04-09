import { parentPort } from "worker_threads";

if (!parentPort) {
    throw new Error("must be run in a worker")
}

parentPort.on("message", async (data) => {
    if (!parentPort) return

    const { guildId, notifications } = data;

    try {
        // Simulate processing notifications (e.g., sending them to a channel)
        console.log(`[Worker] Processing ${notifications.length} notifications for guild ${guildId}`);
        // Simulate a delay for processing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        parentPort.postMessage({ status: "success" });
    } catch (error: any) {
        console.error(`[Worker] Error processing notifications for guild ${guildId}:`, error);
        parentPort.postMessage({ status: "error", error: error.message });
    }
});
