import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, type OverwriteResolvable, type VoiceBasedChannel } from "discord.js";
import { channels_guests, users_channels, channels_users, type ApplicationCommand } from "..";
import { is_private } from "../utils/channelUtils";

export const PrivateCommand: ApplicationCommand = {
  data: new SlashCommandBuilder()
    .setName("private")
    .setDescription("Toggle the private mode"),

  async execute(interaction: ChatInputCommandInteraction) {
    const author = interaction.member as GuildMember
    const author_voice_channel = author.voice.channel

    if (!author_voice_channel) {
      interaction.reply({ content: "You're not in a voice channel", flags: "Ephemeral" })
      return
    }

    // Initialize the guest list for the channel if it doesn't exist
    if (!channels_guests.has(author_voice_channel.id))
      channels_guests.set(author_voice_channel.id, [])

    const guest_ids = channels_guests.get(author_voice_channel.id)!
    const is_owner = users_channels.get(author.id) === author_voice_channel.id

    if (!is_owner) {
      interaction.reply({ content: "This channel is not yours", flags: "Ephemeral" })
      return
    }

    // If the channel is already private, make it public by resetting permissions
    if (is_private(author_voice_channel)) {
      author_voice_channel.permissionOverwrites.set([])
      interaction.reply({ content: "Your channel is now public", flags: "Ephemeral" })
      return
    }

    // Otherwise, make the channel private
    disconnect_non_guests(author_voice_channel, guest_ids)
    set_permissions(author_voice_channel, author.id, author.guild.id, guest_ids)

    interaction.reply({ content: "Your channel is now private", flags: "Ephemeral" })
  }
}

function set_permissions(voice_channel: VoiceBasedChannel, author_id: string, guild_id: string, guest_ids: string[]) {
  const guest_permissions: OverwriteResolvable[] = guest_ids.map(guest_id => ({
    id: guest_id,
    allow: ["Connect", "ViewChannel"]
  }))

  voice_channel.permissionOverwrites.set([
    ...guest_permissions,
    { id: author_id, allow: ["Connect", "ViewChannel"] },
    { id: guild_id, deny: ["Connect", "ViewChannel"] }
  ])
}

function disconnect_non_guests(voice_channel: VoiceBasedChannel, guest_ids: string[]) {
  const owner_id = channels_users.get(voice_channel.id)

  voice_channel.members.forEach(channel_member => {
    const is_guest = guest_ids?.includes(channel_member.id)
    const is_channel_owner = channel_member.id === owner_id

    if (!is_guest && !is_channel_owner)
      channel_member.voice.disconnect()
  })
}
