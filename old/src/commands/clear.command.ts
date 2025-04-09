import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.type";

export default {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Supprime un nombre spécifié de messages")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Nombre de messages à supprimer (1-100)")
                .setRequired(true)
        ),

    async execute(interaction) {
        const amount = interaction.options.getInteger("amount", true); // Assure que la valeur est requise
        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: "Veuillez fournir un nombre entre 1 et 100.",
                flags: "Ephemeral"
            });
        }

        try {
            const deletedMessages = await interaction.channel?.bulkDelete(amount, true);
            await interaction.reply({
                content: `Suppression réussie de ${deletedMessages?.size || 0} messages.`,
                flags: "Ephemeral"
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "Une erreur s'est produite lors de la tentative de suppression des messages.",
                flags: "Ephemeral"
            });
        }
    },
} as Command;