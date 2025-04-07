import { VoiceState } from "discord.js";
import { activeVoiceUsers, handleVoiceXP } from "../voice";
import { prisma } from "../prisma";
import type { Event } from "../types/event.type";

const voiceStateUpdateEvent: Event = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldState: VoiceState, newState: VoiceState) {
    const personalCategoryId = "1356040928355160159";
    const user = newState.member?.user || oldState.member?.user;
    if (!user?.id) return;

    const now = new Date();
    const tracker = activeVoiceUsers.get(user.id);

    if (tracker) {
      const minutes = (now.getTime() - tracker.lastUpdate.getTime()) / 60000;
      try {
        await handleVoiceXP(user.id, minutes, tracker.isMuted, tracker.isDeafened);
      } catch (error) {
        console.error(`Failed to handle voice XP for user ${user.id}:`, error);
      }
    }

    if (newState.channel?.parentId === personalCategoryId) {
      activeVoiceUsers.set(user.id, {
        channelId: newState.channel.id,
        lastUpdate: now,
        isMuted: newState.mute || false,
        isDeafened: newState.deaf || false,
      });
    } else if (!newState.channel && activeVoiceUsers.has(user.id)) {
      try {
        await prisma.voiceSession.deleteMany({ where: { userId: user.id } });
      } catch (error) {
        console.error(`Failed to delete voice session for user ${user.id}:`, error);
      }
      activeVoiceUsers.delete(user.id);
    }

    if (oldState.channel?.id === newState.channel?.id &&
      (oldState.mute !== newState.mute || oldState.deaf !== newState.deaf)) {
      activeVoiceUsers.set(user.id, {
        channelId: newState.channel!.id,
        lastUpdate: now,
        isMuted: newState.mute || false,
        isDeafened: newState.deaf || false,
      });
    }
  },
};

export default voiceStateUpdateEvent;
