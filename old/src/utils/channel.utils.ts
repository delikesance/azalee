import { prisma } from "../prisma";
import type { CommandInteraction, VoiceBasedChannel } from "discord.js";

export async function getTemporaryChannel(interaction: CommandInteraction<"cached">): Promise<VoiceBasedChannel | null> {
    const temporaryChannel = await prisma.temporaryChannel.findFirst({
        where: {
            guildId: interaction.guildId,
            ownerId: interaction.user.id
        }
    });

    if (!temporaryChannel) {
        await interaction.reply({
            ephemeral: true,
            embeds: [{
                color: 0xff0000,
                title: "Commande invalide",
                description: "Vous n'avez pas de salon privé pour exécuter cette commande.",
            }]
        });
        return null;
    }

    const channel = interaction.guild.channels.cache.get(temporaryChannel.channelId) 
        ?? await interaction.guild.channels.fetch(temporaryChannel.channelId);

    if (!channel || !channel.isVoiceBased()) {
        await interaction.reply({
            ephemeral: true,
            embeds: [{
                color: 0xff0000,
                title: "Erreur",
                description: "Le canal spécifié n'existe pas ou a été supprimé.",
            }]
        });
        return null;
    }

    return channel;
}
