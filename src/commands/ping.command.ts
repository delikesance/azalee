import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.type";

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Répond avec pong'),

  async execute(interaction) {
    interaction.reply({ content: '🏓 Pong!', flags: "Ephemeral" })
  },
} as Command
