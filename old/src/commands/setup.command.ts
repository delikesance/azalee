import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.type";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Sets up a temporary voice channel system in the server."),

    async execute(interaction) {
        if (!interaction.memberPermissions?.has("Administrator")) {
            return await interaction.reply({
                content: "You do not have the required permissions to use this command.",
                ephemeral: true,
            });
        }

        if (!interaction.channel?.isSendable()) {
            return interaction.reply({
                content: "Ce salon n'est pas disponible pour envoyer des messages.",
                flags: "Ephemeral"
            })
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("create_temp_vc")
                .setLabel("Créer un Salon Vocal")
                .setStyle(ButtonStyle.Primary)
        );

        interaction.channel.send({
            embeds: [
                {
                    title: "Salon Vocal Temporaire",
                    description: "Cliquez sur le bouton ci-dessous pour créer un salon vocal temporaire. Ce salon sera automatiquement supprimé après 5 minutes d'inactivité (aucun utilisateur présent).\n\nVous pouvez également utiliser les commandes suivantes :",
                    fields: [
                        { name: "`/private true/false`", value: "Permet de rendre le salon vocal privé ou public." },
                        { name: "`/add`", value: "Ajoute un utilisateur spécifique au salon vocal privé." },
                        { name: "`/remove`", value: "Retire un utilisateur spécifique du salon vocal privé." },
                    ],
                    color: 0x00AE86,
                },
            ],
            components: [row],
        });
    },
} as Command