import type { VoiceBasedChannel } from "discord.js";
import { prisma } from "../prisma";
import type { Event } from "../types/event.type";
import { cancelChannelDeletion, scheduleChannelDeletion } from "../utils/temporaryVoiceChannel.util";

export default {
    name: "voiceStateUpdate",
    once: false,

    async execute(oldState, newState) {
        const channel = oldState.channel ?? newState.channel;
        const channelId = channel?.id;

        if (!channelId) return;

        const isJoiningChannel = !oldState.channel && newState.channel;
        const isLeavingChannel = oldState.channel && !newState.channel;

        if (isJoiningChannel) await handleChannelJoin(channel);
        if (isLeavingChannel) await handleChannelLeave(channel);
    },
} as Event<"voiceStateUpdate">;

async function handleChannelJoin(channel: VoiceBasedChannel) {
    const existingChannel = await prisma.temporaryVoiceChannel.findFirst({
        where: {
            channelId: channel.id
        }
    });

    if (!existingChannel) return;

    const guild = channel.guild;
    const voiceChannel = guild.channels.cache.get(existingChannel.channelId) as VoiceBasedChannel | undefined;

    if (voiceChannel) cancelChannelDeletion(voiceChannel);
}

async function handleChannelLeave(channel: any) {
    if (channel.members.size === 0) scheduleChannelDeletion(channel);
}
