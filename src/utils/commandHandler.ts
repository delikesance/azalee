import { ChannelType, ChatInputCommandInteraction, Client, Collection, Guild, PermissionsBitField, TextChannel } from "discord.js"
import { config } from "src/config"
import type { Command } from "types/command.type"
import { Log } from "./log.util"
import { createErrorEmbed } from "./embed.util"

export const commandsRegistry = new Collection<string, Command>()

export const registerCommands = async (client: Client) => {
    const commandsData = commandsRegistry.map(command => command.data)

    if (Bun.env.ENV !== "production") {
        const developmentGuild = await client.guilds.fetch(config.guildId)
        await developmentGuild.commands.set(commandsData)
        return Log.info("Registered commands in development guild")
    }

    if (!client.application) throw new Error("Client application is not initialized")
    await client.application.commands.set(commandsData)
    Log.info("Registered global commands")
}

export const handleCommandExecution = (client: Client) => {
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isChatInputCommand()) return

        const command = commandsRegistry.get(interaction.commandName)
        
        if (!command) {
            Log.warning(`No command found for: ${interaction.commandName}`)
            return
        }

        if (!interaction.guild || !interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
            Log.warning(`Invalid interaction context for command: ${interaction.commandName}`)
            return
        }

        if (command.permission && !interaction.memberPermissions?.has(command.permission)) {
            await interaction.reply({
                content: "Vous n'avez pas les permissions requises pour utiliser cette commande.",
                ephemeral: true,
            })
            return
        }

        await command.execute(interaction as ChatInputCommandInteraction & { guild: Guild; channel: TextChannel })
            .catch((error) => {
                Log.error(`Error while executing ${command.data.name}`, error)
                interaction.reply(createErrorEmbed(error))
            })    
    })

}