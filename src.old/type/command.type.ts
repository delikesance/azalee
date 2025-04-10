import type { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export type Command = {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction<"cached">) => Promise<void>
}