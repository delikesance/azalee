import { ChannelType, EmbedBuilder, type ButtonInteraction, type VoiceBasedChannel } from "discord.js";
import { prisma } from "../prisma";

// Constants
const monitoredChannels: Map<string, { channel: VoiceBasedChannel; scheduledForDeletion: number }> = new Map();
const DELETION_DELAY = 1 * 60 * 1000; // 5 minutes

/**
 * Schedules a voice channel for deletion if it is empty.
 * @param channel The voice channel to schedule for deletion.
 */
export function scheduleChannelDeletion(channel: VoiceBasedChannel) {
    const channelId = channel.id;

    if (monitoredChannels.has(channelId)) monitoredChannels.set(channelId, { channel, scheduledForDeletion: Date.now() + DELETION_DELAY });
    else if (channel.members.size === 0) monitoredChannels.set(channelId, { channel, scheduledForDeletion: Date.now() + DELETION_DELAY });
}

/**
 * Cancels the scheduled deletion of a voice channel.
 * @param channel The voice channel to cancel deletion for.
 */
export function cancelChannelDeletion(channel: VoiceBasedChannel) {
    monitoredChannels.delete(channel.id);
}

/**
 * Starts a scheduler that periodically checks for inactive channels and deletes them.
 */
export async function startChannelCleanupScheduler() {
    setInterval(async () => {
        const now = Date.now();

        for (const [channelId, { channel, scheduledForDeletion }] of monitoredChannels) {
            if (channel.members.size > 0) {
                monitoredChannels.delete(channelId);
            } else if (scheduledForDeletion <= now) {
                await channel.delete();
                await prisma.temporaryVoiceChannel.delete({
                    where: { guildId: channel.guildId, channelId },
                });

                monitoredChannels.delete(channelId);
                console.log(`Deleted inactive channel: ${channelId}`);
            }
        }
    }, 60 * 1000); // Runs every minute
}

/**
 * Handles the creation of a temporary voice channel when a user interacts with a button.
 * @param interaction The button interaction that triggered the creation.
 */
export async function handleTemporaryVoiceChannelCreation(interaction: ButtonInteraction<"cached">) {
    // Check if the user already has a temporary voice channel
    const existingChannel = await prisma.temporaryVoiceChannel.findFirst({
        where: {
            guildId: interaction.guildId,
            ownerId: interaction.user.id,
        },
    });

    if (existingChannel) {
        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("Salon vocal déjà existant")
            .setDescription(`Vous avez déjà un salon vocal temporaire : <#${existingChannel.channelId}>.`)
            .setTimestamp()
            .setFooter({ text: "Veuillez utiliser votre salon existant." });

        await interaction.reply({ embeds: [embed], flags: "Ephemeral" });
        return;
    }

    // Create a new temporary voice channel
    const channel = await interaction.guild!.channels.create({
        name: `Temp VC - ${interaction.user.id}`,
        type: ChannelType.GuildVoice,
        parent: interaction.channel!.parentId,
        permissionOverwrites: [
            {
                id: interaction.guild!.id,
                deny: ['Connect'],
            },
            {
                id: interaction.user.id,
                allow: ['Connect', 'Speak'],
            },
        ],
    });

    // Schedule the channel for deletion
    scheduleChannelDeletion(channel);

    // Save the channel to the database
    await prisma.temporaryVoiceChannel.create({
        data: {
            guildId: interaction.guildId,
            channelId: channel.id,
            ownerId: interaction.user.id,
        },
    });

    // Notify the user
    const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("Salon vocal temporaire créé !")
        .setDescription(`Votre salon vocal temporaire <#${channel.id}> a été créé avec succès.`)
        .setTimestamp()
        .setFooter({ text: "Amusez-vous bien !" });

    await interaction.reply({ embeds: [embed], flags: "Ephemeral" });
}