import { SlashCommandBuilder } from "discord.js";
import { createEmbed } from "src/utils/embed.util";
import { type Command } from "types/command.type";

export const ClearCommand = {
    permission: "ManageMessages",

    async execute(interaction) {
        const number = interaction.options.getNumber("number", true)

        if (!interaction.guild.members.me!.permissions.has("ManageMessages")) 
            throw new Error("Je n'ai pas la permission de supprimer les messages.")
    
        const deletedMessages = await interaction.channel.bulkDelete(number)
        
        return interaction.reply({
            embeds: [createEmbed().setDescription(`${deletedMessages.size} messages supprimés`)],
            flags: "Ephemeral"
        })
    },

    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Supprime un nombre spécifié de messages (entre 1 et 100)")
        .addNumberOption(input =>
            input
                .setName("number")
                .setDescription("Le nombre de messages à supprimer")
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        ),
} as Command