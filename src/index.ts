import { Client } from "discord.js"

const DISCORD_TOKEN = Bun.env.DISCORD_TOKEN
const HUB_CHANNEL_ID = Bun.env.HUB_CHANNEL_ID

const client = new Client({intents: ["Guilds"]})
client.login(DISCORD_TOKEN)
