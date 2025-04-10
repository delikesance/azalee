import { GuildMember, SlashCommandBuilder } from "discord.js";
import type { Command } from "types/command.type";
import { createEmbed } from "utils/embed.util";

export const AvatarCommand = {

    async execute(interaction) {
        const target = interaction.options.getMember("target") ?? interaction.member;
        const useGuildAvatar = interaction.options.getBoolean("guild_avatar") ?? false;

        if (!(target instanceof GuildMember))
            throw new Error("La cible spécifiée n'est pas un membre valide du serveur.");

        const avatarUrl = useGuildAvatar
            ? target.avatarURL({ size: 2048, extension: "webp" }) // Guild avatar
            : target.user.displayAvatarURL({ size: 2048, extension: "webp" }); // Global avatar

        const pngUrl = avatarUrl?.replace(/\.webp$/, ".png");
        const jpgUrl = avatarUrl?.replace(/\.webp$/, ".jpg");
        const gifUrl = avatarUrl?.replace(/\.webp$/, ".gif");

        interaction.reply({
            embeds: [createEmbed()
                .setAuthor({ name: `Avatar de ${target.user.username}`, iconURL: target.user.displayAvatarURL({ size: 2048 }) })
                .setDescription(`[[png]](${pngUrl}) [[jpg]](${jpgUrl}) [[webp]](${avatarUrl}) [[gif]](${gifUrl})`)
                .setImage(avatarUrl)
            ]
        });
    },

    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Affiche votre avatar ou celui d'un utilisateur ciblé")
        .addUserOption(input =>
            input
                .setName("target")
                .setDescription("Utilisateur dont vous souhaitez voir l'avatar")
                .setRequired(false)
        )
        .addBooleanOption(input =>
            input
                .setName("guild_avatar")
                .setDescription("Afficher l'avatar du serveur au lieu de l'avatar global")
                .setRequired(false)
        )
} as Command;