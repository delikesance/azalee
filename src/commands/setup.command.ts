import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from "discord.js"
import type { Command } from "../types/command.type"

export default {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Mettre en place le bot"),

  async execute(interaction) {
    if (!interaction.guild) return

    const customChannelMessageChannel = await interaction.guild.channels.fetch("1358443952419766273")
    if (!customChannelMessageChannel?.isTextBased()) return

    const createChannelBtn = new ButtonBuilder()
      .setCustomId('create-channel')
      .setLabel('Créer ton salon')
      .setStyle(ButtonStyle.Primary)

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(createChannelBtn)

    customChannelMessageChannel.send({
      content: '> Cliquez sur le bouton ci-dessous pour créer votre salon personnel',
      components: [row]
    })
  },
} as Command
