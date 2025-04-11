import type { Event } from "types/event.type";
import { calculateVoiceXp, createVoiceSession } from "../xpSystem.util";

export const xpSystemVoiceStateUpdate = {
    name: "voiceStateUpdate",
    async execute(oldState, newState) {
        const member = newState.member ?? oldState.member;
        if (!member || member.user.bot) return;

        if (oldState.channel?.id !== newState.channel?.id) {
            await calculateVoiceXp(member.id, member.guild.id, false);
            await createVoiceSession(member);
        }
    },
} as Event<"voiceStateUpdate">;
