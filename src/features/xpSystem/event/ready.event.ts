import type { Event } from "types/event.type";
import { Log } from "utils/log.util";
import { createVoiceSession } from "../xpSystem.util";

export const xpSystemReadyEvent = {
    name: "ready",
    async execute(client) {
        const channels = client.channels.cache
        if (channels.size >= 200) return

        let counter = 0

        for await (const channel of channels.values()) {
            if (!channel.isVoiceBased()) continue; 

            for await (const member of channel.members.values()) {
                await createVoiceSession(member)
                counter++;
            }
        }

        Log.info(`${counter} members updated for the voice xp`)
    },
} as Event<"ready">