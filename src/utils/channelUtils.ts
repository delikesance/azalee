import type { Guild, VoiceBasedChannel } from "discord.js"

export function is_private(channel: VoiceBasedChannel): boolean {
  const permissions = channel.permissionsFor(channel.guildId)

  if (!permissions) return false
  if (permissions.has("Connect")) return false
  else return true
}

export async function get_channel(guild: Guild, channelId: string) {
  return guild.channels.cache.get(channelId) ?? await guild.channels.fetch(channelId).catch(() => null)
}
