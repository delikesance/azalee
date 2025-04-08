import { SlashCommandBuilder, type GuildMember } from "discord.js";
import type { Command } from "../types/command.type";
import { getTemporaryChannel } from "../utils/channel.utils";

export default {
    data: new SlashCommandBuilder()
        .setName("add")
        .setDescription("Gérer les permissions d'accès d'un membre dans un salon privé")
        .addUserOption(option =>
            option.setName("member")
                .setDescription("Le membre à gérer dans le salon privé")
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName("allow")
                .setDescription("Autoriser ou refuser l'accès au membre")
                .setRequired(true)
        ),

    async execute(interaction) {
        const member = interaction.options.getMember("member")
        const allow = interaction.options.getBoolean("allow", true)

        if (!member) {
            return interaction.reply({
                ephemeral: true,
                content: "Le membre spécifié est introuvable.",
            })
        }

        const channel = await getTemporaryChannel(interaction)
        if (!channel) return

        if (!allow && member.voice.channel?.id === channel.id) {
            await member.voice.disconnect().catch(() => {
                console.error(`Failed to disconnect ${member.user.username} from the voice channel.`);
                interaction.followUp({
                    ephemeral: true,
                    content: "Impossible de déconnecter le membre du salon vocal.",
                })
            })
        }

        await channel.permissionOverwrites.edit(member.id, {
            ViewChannel: allow,
            Connect: allow,
        });

        await interaction.reply({
            ephemeral: true,
            embeds: [{
                color: 0x00ff00,
                title: "Succès",
                description: `Les permissions pour ${member.user.username} ont été ${allow ? "accordées" : "révoquées"} avec succès dans le salon privé.`,
            }],
        });
    },
} as Command;