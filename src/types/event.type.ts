import type { ClientEvents } from "discord.js";

export type Event = {
  name: keyof ClientEvents; // Use Discord.js event names for auto-completion
  once: boolean;
  execute: (...args: any[]) => Promise<void> | void;
};
