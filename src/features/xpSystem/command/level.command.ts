import { AttachmentBuilder, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from "discord.js";
import { prisma } from "src/prisma";
import type { Command } from "types/command.type";
import { calculateVoiceXp, calculateXpThreshold, getVoiceSession, handleLevelUp } from "../xpSystem.util";
import { createCanvas, loadImage } from "canvas";
import { createEmbed } from "utils/embed.util";

async function createLevelImage(level: number, xp: number, xpThreshold: number, avatarUrl: string): Promise<Buffer> {
    const width = 1356;
    const height = 500;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const avatar = await loadImage(avatarUrl);
    const avatarAspectRatio = avatar.width / avatar.height;
    const canvasAspectRatio = width / height;

    let drawWidth, drawHeight;

    if (avatarAspectRatio > canvasAspectRatio) {
        drawHeight = height;
        drawWidth = height * avatarAspectRatio;
    } else {
        drawWidth = width;
        drawHeight = width / avatarAspectRatio;
    }

    const xOffset = (width - drawWidth) / 2;
    const yOffset = (height - drawHeight) / 2;

    ctx.globalAlpha = 0.10
    ctx.drawImage(avatar, xOffset, yOffset, drawWidth, drawHeight);

    ctx.globalAlpha = 1
    ctx.drawImage(avatar, 0, 0, height, height);

    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";

    const levelText = `Niv. ${level}`;
    const xpText = `${xp}/${xpThreshold}`;

    const levelTextHeight = ctx.measureText(levelText).actualBoundingBoxAscent;

    const xpTextHeight = ctx.measureText(xpText).actualBoundingBoxAscent;

    const progressBarWidth = width - (height + 100);
    const progressBarHeight = 20;
    const progressBarX = height + 50

    const progressBarY = (height / 2) + (progressBarHeight / 2) + (levelTextHeight / 2) + 5;
    const texty = (height / 2) + (levelTextHeight / 2) - (progressBarHeight / 2) - 5

    ctx.fillText(levelText, height + 50, texty);

    ctx.font = "bold 24px Arial";
    ctx.textAlign = "right"
    ctx.fillStyle = "#51ABFF";

    const xpy = (height / 2) + (xpTextHeight / 2) - (progressBarHeight / 2) - 5
    ctx.fillText(xpText, width - 50, xpy);

    ctx.fillStyle = "#fff";
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

    const progressFillWidth = (xp / xpThreshold) * progressBarWidth;
    ctx.fillStyle = "#51ABFF";
    ctx.fillRect(progressBarX, progressBarY, progressFillWidth, progressBarHeight);

    const buffer = canvas.toBuffer('image/png');
    return buffer;
}

async function sendLevelResponse({ interaction, level, xp, xpThreshold, target }: { interaction: ChatInputCommandInteraction, level: number, xp: number, xpThreshold: number, target: GuildMember }) {
    const imageBuffer = await createLevelImage(level, xp, xpThreshold, target.displayAvatarURL({ extension: "png", size: 4096 }))
    const attachment = new AttachmentBuilder(imageBuffer).setName("card.png")

    interaction.reply({
        content: target.toString(),
        embeds: [createEmbed().setImage(`attachment://${attachment.name}`)],
        files: [attachment]
    })
}

export const LevelCommand = {
    async execute(interaction) {
        const target = interaction.options.getMember("target") ?? interaction.member;
        if (!(target instanceof GuildMember)) throw new Error("Les informations sur le membre sont indisponibles. Cette commande doit être utilisée dans un serveur.");

        const { id: memberID } = target;
        const { id: guildID } = interaction.guild;

        const initialRecord = await prisma.member.findUnique({
            where: { memberID, guildID },
            select: { level: true, xp: true }
        });

        const voiceSession = await getVoiceSession(memberID, guildID)
        if (voiceSession) await calculateVoiceXp(target, target.guild.id, voiceSession.startedAt.getTime())

        if (!initialRecord)
            return sendLevelResponse({ interaction, level: 1, xp: 0, xpThreshold: 100, target });
    
        const updatedRecord = await handleLevelUp(initialRecord, target) ?? initialRecord;
        const xpThreshold = calculateXpThreshold(updatedRecord);

        return sendLevelResponse({ interaction, level: updatedRecord.level, xp: updatedRecord.xp, xpThreshold, target });
    },

    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Vérifier le niveau courant d'un utilisateur.")
        .addUserOption(input =>
            input
                .setName("target")
                .setDescription("Utilisateur dont vous souhaitez voir le niveau")
                .setRequired(false)
        ),
} as Command;
