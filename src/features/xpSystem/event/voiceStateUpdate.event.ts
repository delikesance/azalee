import type { Event } from "types/event.type";
import { calculateVoiceXp, createVoiceSession, getVoiceSession } from "../xpSystem.util";
import { prisma } from "src/prisma";


export const xpSystemVoiceStateUpdate = {
    name: "voiceStateUpdate",
    async execute(oldState, newState) {
        const member = newState.member ?? oldState.member
        if (!member) return

        // joining voice channel
        if (!oldState.channel && newState.channel)
            await createVoiceSession(member)

        // leaving voice channel
        if (oldState.channel && !newState.channel) {
            const voiceSession = await getVoiceSession(member.id, member.guild.id)
            if (voiceSession) return calculateVoiceXp(member, member.guild.id, voiceSession.startedAt.getTime())
        }
    },
} as Event<"voiceStateUpdate">