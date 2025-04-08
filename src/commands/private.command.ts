import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.type";
import { getTemporaryChannel } from "../utils/channel.utils";

export default {
    data: new SlashCommandBuilder()
        .setName("private")
        .setDescription("Basculer les permissions d'accès pour un salon privé"),

    async execute(interaction) {
        const channel = await getTemporaryChannel(interaction);
        if (!channel) return;

        const currentPermissions = channel.permissionOverwrites.cache.get(interaction.guild.id);
        const isCurrentlyPrivate = currentPermissions?.deny.has("ViewChannel") ?? false;

        const newIsPrivate = !isCurrentlyPrivate;

        await channel.permissionOverwrites.edit(interaction.guild.id, {
            ViewChannel: !newIsPrivate,
            Connect: !newIsPrivate,
        });

        await interaction.reply({
            flags: "Ephemeral",
            embeds: [{
                color: 0x00ff00,
                title: "Succès",
                description: `${newIsPrivate ? "🔒" : "🔓"} Le salon a été ${newIsPrivate ? "rendu privé" : "rendu public"}`,
            }]
        })
    },
} as Command;
