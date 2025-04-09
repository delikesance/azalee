import type { ChatInputCommandInteraction } from "discord.js";
import type { Event } from "../type/event.type";
import { commands } from "../util/command.util";
import { createErrorEmbed } from "../util/embed.util";

export default {
    name: "interactionCreate",

    async execute(interaction) {
        if (interaction.isChatInputCommand()) handleCommandInteraction(interaction)
    },
} as Event<"interactionCreate">

async function handleCommandInteraction(interaction: ChatInputCommandInteraction) {
    const command = commands.get(interaction.commandName)

    if (!command) return interaction.reply(createErrorEmbed("La commande que vous avez utilisée n'existe pas ou n'est pas reconnue. Veuillez vérifier son nom et réessayer."))
    if (!interaction.guild) return interaction.reply(createErrorEmbed("Cette commande doit être utilisée dans un serveur Discord."));

    if (!interaction.inCachedGuild()) await interaction.guild?.fetch();
    
    command.execute(interaction as ChatInputCommandInteraction<"cached">).catch((reason) => {
        interaction.reply(createErrorEmbed(String(reason)))
    });
}