import type { Event } from "../types/event.type";

export default {
    name: "messageCreate",
    once: false,

    async execute(message) {
        //TODO: implement XP logic for message creation
    },
} as Event<"messageCreate">;
