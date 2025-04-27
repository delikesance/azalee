import { GuildMember, VoiceState, ChannelType } from "discord.js"
import { channels_users, users_channels, type DiscordEvent } from ".."
import { get_channel } from "../utils/channelUtils"
import { HUB_CHANNEL_ID } from "../config"

export const VoiceStateUpdateEvent: DiscordEvent<"voiceStateUpdate"> = {
  name: "voiceStateUpdate",
  async execute(oldState, newState) {
    const member = newState.member ?? oldState.member
    if (!member) return

    if (newState.channelId === HUB_CHANNEL_ID)
      await handle_hub_join(member, newState)

    if (oldState.channelId && newState.channelId !== oldState.channelId)
      return await handle_channel_switch(member, oldState, newState)
  }
}

/**
* Handles the event when a user switches voice channel 
* @param member - The member who switched channels
* @param oldState - The old voice state
* @param newState - The new voice state
*/
async function handle_channel_switch(member: GuildMember, oldState: VoiceState, _newState: VoiceState) {
  const userId = channels_users.get(oldState.channelId!)
  if (!userId || !oldState.channelId) return

  const channel = await get_channel(oldState.guild, oldState.channelId)
  const isPrivate = channel && channel.isVoiceBased() && channel.members.size === 0 && oldState.channelId != HUB_CHANNEL_ID

  if (!isPrivate) return

  users_channels.delete(member.id)
  channels_users.delete(oldState.channelId)

  await channel.delete("private voice channel cleanup")
}

/**
* Handles the event when a user joins the hub channel
* @param member - The member who joined the hub channel
* @param newState - The new voice state
*/
async function handle_hub_join(member: GuildMember, newState: VoiceState) {
  if (newState.channelId !== HUB_CHANNEL_ID) return

  const existingChannelId = users_channels.get(member.id)

  if (existingChannelId) {
    member.voice.setChannel(existingChannelId)
    return
  }

  const createdChannel = await newState.guild.channels.create({
    type: ChannelType.GuildVoice,
    name: `${member.user.username}'s room`,
  })

  users_channels.set(member.id, createdChannel.id)
  channels_users.set(createdChannel.id, member.id)

  member.voice.setChannel(createdChannel)
}
