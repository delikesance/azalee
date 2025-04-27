import { ChannelType, ChatInputCommandInteraction, Client, GuildMember, VoiceState, type ApplicationCommandDataResolvable, type ClientEvents } from "discord.js"
import { PrivateCommand } from "./commands/private"
import { InviteCommand } from "./commands/invite"
import { get_channel } from "./utils/channelUtils"
import { ReadyEvent } from "./events/ready"
import { DISCORD_TOKEN, HUB_CHANNEL_ID, DEV_GUILD_ID } from "./config"

if (!DISCORD_TOKEN || !HUB_CHANNEL_ID || !DEV_GUILD_ID) {
  console.log("Missing env variable (DISCORD_TOKEN, HUB_CHANNEL_ID or DEV_GUILD_ID)")
  process.exit(1)
}

// Initialize the Discord client with necessary intents
const client = new Client({ intents: ["Guilds", "GuildVoiceStates"] })
client.login(DISCORD_TOKEN)

// register the commands for the development guild
const dev_guild = client.guilds.cache.get(DEV_GUILD_ID) || await client.guilds.fetch(DEV_GUILD_ID)
if (!dev_guild) process.exit(1)

client.on("ready", () => {
  dev_guild.commands.set(commands.values().map(a => a.data).toArray())
})

// Collection to map user IDs to channel IDs and vice versa
export const users_channels = new Map<string, string>; // channelId -> userId
export const channels_users = new Map<string, string>; // userId -> channelId
export const channels_guests = new Map<string, string[]>()

// types
export type ApplicationCommand = { data: ApplicationCommandDataResolvable, execute: (interaction: ChatInputCommandInteraction) => Promise<void> }
export interface DiscordEvent<T extends keyof ClientEvents> {
  name: T;
  once?: boolean;
  execute: (...args: ClientEvents[T]) => Promise<void>;
}

// handle the commands execution
const commands = new Map<string, ApplicationCommand>()
commands.set("invite", InviteCommand)
commands.set("private", PrivateCommand)

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = commands.get(interaction.commandName)
  if (!command) {
    interaction.reply({ content: "command not found", flags: "Ephemeral" })
    return
  }

  command.execute(interaction)
})

// handle events 
const events = [ReadyEvent];
events.forEach(event => {
  client.on(event.name, event.execute)
})


