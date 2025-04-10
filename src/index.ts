import { Client } from "discord.js";
import type { Event } from "types/event.type";
import { commandsRegistry, handleCommandExecution, registerCommands } from "utils/commandHandler";
import { Log } from "utils/log.util";
import { config } from "src/config";
import { prisma } from "src/prisma";
import { PingCommand } from "./commands/user/ping.command";
import { LevelCommand } from "./features/xpSystem/command/level.command";
import { TopCommand } from "./features/xpSystem/command/top.command";
import { AvatarCommand } from "./commands/user/avatar.command";
import { ClearCommand } from "./commands/admin/clear.command";
import { XpSystemMessageCreateEvent } from "./features/xpSystem/event/messageCreate.event";
import { xpSystemVoiceStateUpdate } from "./features/xpSystem/event/voiceStateUpdate.event";
import { xpSystemReadyEvent } from "./features/xpSystem/event/ready.event";

const client = new Client({ intents: config.intents });



async function bootstrap() {
    await prisma.$connect()
        .catch((reason) => Log.error("Couldn't connect to the database", reason))
        .then(() => Log.info("Connected to the database"))

    await initializeClient();
    await initializeEvents();
    await initializeCommands();
}

async function initializeClient() {
    await client.login(config.token);
    Log.info("Client started");
}

async function initializeEvents() {
    const events: Event<any>[] = [XpSystemMessageCreateEvent, xpSystemVoiceStateUpdate, xpSystemReadyEvent]
    await registerEventListeners(events)

    Log.info("All events are now being listened to.");
}

async function registerEventListeners(events: Event[]) {
    for await (const event of events) {
        attachEventListener(event);
    }
}

function attachEventListener(event: Event) {
    client[event.once ? "once" : "on"](event.name, event.execute);
}

async function initializeCommands() {
    commandsRegistry
        .set("ping", PingCommand)
        .set("level", LevelCommand)
        .set("top", TopCommand)
        .set("avatar", AvatarCommand)
        .set("clear", ClearCommand)

    await registerCommands(client);
    handleCommandExecution(client);
}

bootstrap().catch((error) => Log.error("Error during bootstrap:", error));
