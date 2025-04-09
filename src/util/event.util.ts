import type { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { promiseHooks } from "v8";

export async function handleEvents(client: Client) {
    const eventsPath = join(__dirname, "..", "event");
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith(".event.js") || file.endsWith(".event.ts"));

    const loadPromises = eventFiles.map(async (file) => {
        const eventPath = join(eventsPath, file);
        const { default: event } = require(eventPath);

        if (event.once) client.once(event.name, (...args) => event.execute(...args));
        else client.on(event.name, (...args) => event.execute(...args));
    })

    await Promise.all(loadPromises)
}