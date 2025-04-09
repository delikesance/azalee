import { IntentsBitField } from "discord.js";

export const config = {
    token: Bun.env.TOKEN || '',
    guildId: Bun.env.GUILD_ID || '',
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildVoiceStates, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMessages],
}