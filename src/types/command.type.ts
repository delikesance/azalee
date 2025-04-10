import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder, TextChannel, type PermissionResolvable } from "discord.js"

export type Command = {
    data: SlashCommandBuilder
    permission?: keyof typeof PermissionsBitField.Flags
    execute: (interaction: ChatInputCommandInteraction & { 
        guild: NonNullable<ChatInputCommandInteraction["guild"]>, 
        channel: NonNullable<ChatInputCommandInteraction["channel"]> & TextChannel
    }) => Promise<any>
}