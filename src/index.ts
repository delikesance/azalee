import { Client } from "discord.js";
import { config } from "./config";
import { prisma } from "./prisma";
import { loadCommands } from "./utils/commands.util";
import { handleEvents } from "./utils/events.util";

const client = new Client({ intents: config.intents });

async function bootstrap() {
    await prisma.$connect()
        .catch(console.error)
        .then(() => console.log('connected to the database'));

    client.on('ready', () => {
        loadCommands(client);
        handleEvents(client);
    });

    client.login(config.token);
}

async function handleGracefulShutdown() {
    console.log("Shutting down gracefully...");

    await prisma.$disconnect()
        .then(() => console.log("Disconnected from the database"))
        .catch(console.error)

    process.exit(0)
}

process.on('SIGINT', handleGracefulShutdown);
process.on('SIGTERM', handleGracefulShutdown);

bootstrap().catch(console.error);
