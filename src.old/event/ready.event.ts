import type { Event } from "../type/event.type";

export default {
    name: "ready",
    once: true,

    async execute(client) {
    },
} as Event<"ready">