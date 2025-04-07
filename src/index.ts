import { Client, Collection, GatewayIntentBits } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { ENV } from "./config";
import type { Command } from "./types/command.type";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Collection<string, Command>();

async function loadEvents() {
  const eventFiles = readdirSync(path.join(__dirname, "events")).filter((file) => file.endsWith(".ts"));

  for (const file of eventFiles) {
    try {
      const event = await import(path.join(__dirname, "events", file));
      if (event.default.once) {
        client.once(event.default.name, (...args) => event.default.execute(...args, client));
      } else {
        client.on(event.default.name, (...args) => event.default.execute(...args, client));
      }
    } catch (error) {
      console.error(`Failed to load event file ${file}:`, error);
    }
  }
}

async function loadCommands() {
  const commandFiles = readdirSync(path.join(__dirname, "commands")).filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    try {
      const command = await import(path.join(__dirname, "commands", file));
      if (command.default && command.default.data && command.default.data.name) {
        commands.set(command.default.data.name, command.default);
      } else {
        console.error(`Invalid command file: ${file}`);
      }
    } catch (error) {
      console.error(`Failed to load command file ${file}:`, error);
    }
  }
}

async function bootstrap() {
  try {
    await loadEvents();
    await loadCommands();
    await client.login(ENV.TOKEN);
    console.log("Bot is running!");
  } catch (error) {
    console.error("Failed to bootstrap the bot:", error);
  }
}

bootstrap();

