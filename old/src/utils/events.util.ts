import type { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

export function handleEvents(client: Client) {
    const eventsPath = join(__dirname, "..", "events");
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));

    for (const file of eventFiles) {
        const eventPath = join(eventsPath, file);
        const { default: event } = require(eventPath);

        if (event.once) client.once(event.name, (...args) => event.execute(...args));
        else client.on(event.name, (...args) => event.execute(...args));
    }
}