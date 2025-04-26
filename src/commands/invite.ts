import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { is_private } from "../utils/channelUtils";
import { channels_guests, users_channels, type ApplicationCommand } from "..";

export const InviteCommand: ApplicationCommand = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite a user to your private voice channel")
    .addUserOption(input => input.setName("target")
      .setDescription("The user you want to invite")
      .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember
    const user_voice_channel = member.voice.channel

    if (!user_voice_channel) {
      interaction.reply({ content: "You're not in a voice channel", flags: "Ephemeral" })
      return
    }

    if (users_channels.get(member.id) !== user_voice_channel.id) {
      interaction.reply({ content: "This channel is not yours", flags: "Ephemeral" })
      return
    }

    const target = interaction.options.getUser("target")

    if (!target) {
      interaction.reply({ content: "The target is not a valid one", flags: "Ephemeral" })
      return
    }

    if (is_private(user_voice_channel)) {
      user_voice_channel.permissionOverwrites.edit(target.id, {
        Connect: true,
        ViewChannel: true
      })
    }

    if (!channels_guests.has(user_voice_channel.id)) channels_guests.set(user_voice_channel.id, [])

    const channel_guests = channels_guests.get(user_voice_channel.id)!
    if (!channel_guests.includes(target.id)) channel_guests.push(target.id)

    console.log(channels_guests)

    const url = `https://discord.com/channels/${user_voice_channel.guildId}/${user_voice_channel.id}`
    target.send(`${member.user.username} invited you to his private voice channel : ${url}`)

    interaction.reply("invitation sent")
  }
}
