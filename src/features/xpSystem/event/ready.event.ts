import type { Event } from "types/event.type";
import { Log } from "utils/log.util";
import { createVoiceSession } from "../xpSystem.util";

export const xpSystemReadyEvent = {
    name: "ready",
    async execute(client) {

    },
} as Event<"ready">