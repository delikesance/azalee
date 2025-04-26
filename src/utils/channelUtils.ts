import type { VoiceBasedChannel } from "discord.js"

export function is_private(channel: VoiceBasedChannel): boolean {
  const permissions = channel.permissionsFor(channel.guildId)

  if (!permissions) return false
  if (permissions.has("Connect")) return false
  else return true
}
