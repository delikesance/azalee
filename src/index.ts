import { ChannelType, ChatInputCommandInteraction, Client, Collection, ConnectionService, Guild, GuildMember, PermissionsBitField, SlashCommandBuilder, VoiceState, type OverwriteResolvable, type VoiceBasedChannel } from "discord.js"

const DISCORD_TOKEN = Bun.env.DISCORD_TOKEN
const HUB_CHANNEL_ID = Bun.env.HUB_CHANNEL_ID

// Initialize the Discord client with necessary intents
const client = new Client({ intents: ["Guilds", "GuildVoiceStates"] })
client.login(DISCORD_TOKEN)

const dev_guild = client.guilds.cache.get("1318391877103255572") || await client.guilds.fetch("1318391877103255572")
if (!dev_guild) process.exit(1)

function is_private(channel: VoiceBasedChannel): boolean {
  const permissions = channel.permissionsFor(channel.guildId)

  if (!permissions) return false
  if (permissions.has("Connect")) return false
  else return true
}

const channels_guests = new Map<string, string[]>()

async function handle_private_command(interaction: ChatInputCommandInteraction) {
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

async function handle_invite_command(interaction: ChatInputCommandInteraction) {
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

client.on("ready", () => {
  dev_guild.commands.set([
    new SlashCommandBuilder().setName("private")
      .setDescription("define if a channel is public or private"),

    new SlashCommandBuilder().setName("invite")
      .setDescription("invite someone to your private channel")
      .addUserOption(input => input.setName("target").setRequired(true).setDescription("the user you want to invite"))
  ])
})

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return
  if (interaction.commandName === "private") handle_private_command(interaction)
  if (interaction.commandName === "invite") handle_invite_command(interaction)
})

/**
* Fetches channel by its ID from the guild
* @param guild - The guild to search within
* @param channelId - The ID of the channel to fetch
* @returns Then channel if found, otherwise null
*/
async function get_channel(guild: Guild, channelId: string) {
  return guild.channels.cache.get(channelId) ?? await guild.channels.fetch(channelId).catch(() => null)
}

client.on("ready", (client) => {
  console.log(`Connected as ${client.user.username}`)
})

// Collection to map user IDs to channel IDs and vice versa
const users_channels = new Collection<string, string>; // channelId -> userId
const channels_users = new Collection<string, string>; // userId -> channelId

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
async function handle_channel_switch(member: GuildMember, oldState: VoiceState, newState: VoiceState) {
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
