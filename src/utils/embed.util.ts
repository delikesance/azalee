import { EmbedBuilder, MessageFlagsBitField, type InteractionReplyOptions } from "discord.js";

export function createEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setFooter({ text: "Made with 💗 by Delikesance" })
        .setColor("Blue")
}

export const createErrorEmbed = (description: string): InteractionReplyOptions => {
    return {
        flags: [MessageFlagsBitField.Flags.Ephemeral],
        embeds: [createEmbed()
            .setTitle("❌ Erreur")
            .setDescription(description)
            .setColor(0xff0000)]
    }
};