import { ChatInputCommandInteraction, type Client, Collection } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { config } from "../config";
import { type Command } from "../types/command.type";

export const commands = new Collection<string, Command>();

export async function loadCommands(client: Client) {
    const commandsPath = join(__dirname, "..", "commands");
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js") || file.endsWith(".ts"));

    for (const file of commandFiles) {
        const commandPath = join(commandsPath, file);
        const { default: command } = await import(commandPath) as { default: Command };
        if (command) commands.set(command.data.name, command);
    }

    const devGuild = await client.guilds.fetch(config.guildId).catch(() => null);
    if (devGuild) await devGuild.commands.set(commands.map(command => command.data));
}

export async function handleCommand(interaction: ChatInputCommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    if (!interaction.inCachedGuild()) {
        await interaction.guild?.fetch();
    }

    command.execute(interaction as ChatInputCommandInteraction<"cached">).catch(async (error) => {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        const response = { content: 'There was an error while executing this command!', ephemeral: true };

        if (interaction.replied || interaction.deferred) await interaction.followUp(response);
        else await interaction.reply(response);
    });
}