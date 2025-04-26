import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, type OverwriteResolvable } from "discord.js";
import { channels_guests, users_channels, channels_users, type ApplicationCommand } from "..";
import { is_private } from "../utils/channelUtils";

export const PrivateCommand: ApplicationCommand = {
  data: new SlashCommandBuilder()
    .setName("private")
    .setDescription("Toggle the private mode"),

  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember
    const user_voice_channel = member.voice.channel

    if (!user_voice_channel) {
      interaction.reply({ content: "You're not in a voice channel", flags: "Ephemeral" })
      return
    }

    if (!channels_guests.has(user_voice_channel.id)) channels_guests.set(user_voice_channel.id, [])
    const channel_guests = channels_guests.get(user_voice_channel.id)!

    if (users_channels.get(member.id) !== user_voice_channel.id) {
      interaction.reply({ content: "This channel is not yours", flags: "Ephemeral" })
      return
    }

    if (is_private(user_voice_channel)) {
      user_voice_channel.permissionOverwrites.set([])
      interaction.reply({ content: "You channel is now public", flags: "Ephemeral" })

      return
    }

    user_voice_channel.members.forEach(member => {
      const channel_owner = channels_users.get(user_voice_channel.id)
      if (!channel_guests.includes(member.id) && channel_owner !== member.id)
        member.voice.disconnect()
    })

    if (!channels_guests.has(user_voice_channel.id)) channels_guests.set(user_voice_channel.id, [])
    const permissions: OverwriteResolvable[] = channels_guests.get(user_voice_channel.id)!.map(guest => ({ id: guest, allow: ["Connect", "ViewChannel"] }))
    user_voice_channel.permissionOverwrites.set([
      ...permissions,
      { id: member.id, allow: ["Connect", "ViewChannel"] },
      { id: member.guild.id, deny: ["Connect", "ViewChannel"] }
    ])

    interaction.reply({ content: "You channel is now private", flags: "Ephemeral" })

  }
}
