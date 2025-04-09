import { Client } from "discord.js";
import { prisma } from "./prisma"
import { config } from "./config";
import { loadCommands } from "./util/command.util";
import { handleEvents } from "./util/event.util";

const client = new Client({ intents: config.intents });

async function bootstrap() {
    await prisma.$connect().then(() => console.log("[Database] Successfully connected to the database."));
    await client.login(config.token).then(() => console.log("[Discord] Successfully logged in to the Discord API."));

    loadCommands(client).then(() => console.log("[Commands] All commands have been successfully loaded."));
    handleEvents(client).then(() => console.log("[Events] All event handlers have been successfully registered."));
}

bootstrap().catch(console.error);