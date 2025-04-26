import { ChannelType, ChatInputCommandInteraction, Client, Collection, ConnectionService, Guild, GuildMember, PermissionsBitField, SlashCommandBuilder, VoiceState, type ApplicationCommandDataResolvable, type OverwriteResolvable, type VoiceBasedChannel } from "discord.js"
import { PrivateCommand } from "./commands/private"
import { InviteCommand } from "./commands/invite"
import { get_channel } from "./utils/channelUtils"

const DISCORD_TOKEN = Bun.env.DISCORD_TOKEN
const HUB_CHANNEL_ID = Bun.env.HUB_CHANNEL_ID

// Initialize the Discord client with necessary intents
const client = new Client({ intents: ["Guilds", "GuildVoiceStates"] })
client.login(DISCORD_TOKEN)

const dev_guild = client.guilds.cache.get("1318391877103255572") || await client.guilds.fetch("1318391877103255572")
if (!dev_guild) process.exit(1)

client.on("ready", () => {
  dev_guild.commands.set(commands.values().map(a => a.data).toArray())
})

export type ApplicationCommand = { data: ApplicationCommandDataResolvable, execute: (interaction: ChatInputCommandInteraction) => Promise<void> }

const commands = new Map<string, ApplicationCommand>()
commands.set("private", PrivateCommand)
commands.set("invite", InviteCommand)

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = commands.get(interaction.commandName)
  if (!command) {
    interaction.reply({ content: "command not found", flags: "Ephemeral" })
    return
  }

  command.execute(interaction)
})

client.on("ready", (client) => {
  console.log(`Connected as ${client.user.username}`)
})

// Collection to map user IDs to channel IDs and vice versa
export const users_channels = new Map<string, string>; // channelId -> userId
export const channels_users = new Map<string, string>; // userId -> channelId
export const channels_guests = new Map<string, string[]>()

client.on("voiceStateUpdate", async (oldState, newState) => {
  const member = newState.member ?? oldState.member
  if (!member) return

  if (newState.channelId === HUB_CHANNEL_ID)
    await handle_hub_join(member, newState)

  if (oldState.channelId && newState.channelId !== oldState.channelId)
    return await handle_channel_switch(member, oldState, newState)
})

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
