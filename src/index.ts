import { Client, Collection, GatewayIntentBits } from "discord.js";
import { readdirSync } from "fs";
import path from "path";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = new Collection<string, any>();

async function loadCommands() {
  const commandFiles = readdirSync(path.join(__dirname, "commands"));

  const loadPromises = commandFiles.map(async (file) => {
    const commandPath = path.join(__dirname, "commands", file);
    return import(commandPath)
      .then((module) => {
        const command = module.default;
        if (!command || !command.data || !command.data.name) {
          console.error(`Invalid command file: ${file}`);
          return null; // Skip invalid commands
        }
        commands.set(command.data.name, command);
      })
      .catch((err) => {
        console.error(`Failed to load command file: ${file}`, err);
      });
  });

  await Promise.all(loadPromises); // Wait for all commands to be loaded
}

async function refreshCommands() {
  const commandDatas = Array.from(commands.values()).map((c) => c.data);

  if (Bun.env.ENV === "production") {
    client.application?.commands.set(commandDatas).catch((err) => {
      console.error("Failed to refresh global commands:", err);
    });
  } else {
    client.guilds.fetch(Bun.env.GUILD_ID!)
      .then((devGuild) => devGuild.commands.set(commandDatas))
      .catch((err) => {
        console.error("Failed to refresh guild-specific commands:", err);
      });
  }
}

async function bootstrap() {
  await loadCommands();

  client.once("ready", () => {
    console.log(`Connected as ${client.user?.username}`);
    refreshCommands(); // No need to await here; errors are handled internally
  });

  client.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) {
      console.warn(`Command not found: ${interaction.commandName}`);
      return;
    }

    command.execute(interaction).catch((err: Error) => {
      console.error(`Error executing command: ${interaction.commandName}`, err);
    });
  });

  client.login(Bun.env.TOKEN).catch((err) => {
    console.error("Failed to log in:", err);
  });
}

bootstrap().catch((err) => console.error("Bootstrap error:", err));

