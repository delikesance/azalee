import type { Event } from "../types/event.type";
import { handleCommand } from "../utils/commands.util";
import { handleTemporaryVoiceChannelCreation } from "../utils/temporaryVoiceChannel.util";

export default {
    name: "interactionCreate",
    once: false,

    async execute(interaction) {
        if (
            !interaction.guildId || 
            !interaction.guild || 
            !interaction.channel || 
            interaction.channel.isDMBased() || 
            !interaction.inCachedGuild()
        ) return

        if (interaction.isChatInputCommand()) return handleCommand(interaction)
        if (interaction.isButton() && interaction.customId === "create_temp_vc") return handleTemporaryVoiceChannelCreation(interaction)
    },
} as Event<"interactionCreate">;
