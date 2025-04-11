import { IntentsBitField } from "discord.js";

export const config = {
    token: Bun.env.TOKEN || '',
    guildId: Bun.env.GUILD_ID || '',
    intents: [
        IntentsBitField.Flags.Guilds, 
        IntentsBitField.Flags.GuildVoiceStates, 
        IntentsBitField.Flags.MessageContent, 
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers
    ],
}

export const XP_SYSTEM_CONFIG = {
    XP_PER_MINUTE: 10,
    MESSAGE_COOLDOWN_MS: 60000,
    VOICE_SESSION_CLEANUP_INTERVAL_MS: 60000,
    XP_THRESHOLD_BASE: 100,
    XP_THRESHOLD_MULTIPLIER: 1.5,
    TOP_LEADERBOARD_LIMIT: 5,
};