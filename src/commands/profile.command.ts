import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command.type";
import { activeVoiceUsers, handleVoiceXP } from "../voice";
import { prisma } from "../prisma";

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Affiche votre progression'),

  async execute(interaction) {
    const userId = interaction.user.id;

    // Calcul de l'XP en temps réel
    const tracker = activeVoiceUsers.get(userId);
    if (tracker) {
      const now = new Date();
      const minutes = (now.getTime() - tracker.lastUpdate.getTime()) / 60000;
      try {
        await handleVoiceXP(userId, minutes, tracker.isMuted, tracker.isDeafened);
        tracker.lastUpdate = now; // Réinitialise le timer
      } catch (error) {
        console.error(`Failed to handle voice XP for user ${userId}:`, error);
      }
    }

    try {
      const user = await prisma.user.findUnique({
        where: { userId }
      });

      const calculatedLevel = user?.level || 1;
      const displayXP = user?.xp || 0;
      const levelUpXP = Math.pow((calculatedLevel + 1) / 0.1, 2);

      interaction.reply({
        content: `Niveau ${calculatedLevel} | XP: ${displayXP}/${levelUpXP}`,
        flags: "Ephemeral"
      });
    } catch (error) {
      console.error(`Failed to fetch profile for user ${userId}:`, error);
    }
  }
} as Command;

