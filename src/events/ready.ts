import type { Client, ClientEvents } from "discord.js"
import type { DiscordEvent } from ".."

export const ReadyEvent: DiscordEvent<"ready"> = {
  name: "ready",
  async execute(client) {
    console.log(`${client.user.username} is ready`)
  }
}
