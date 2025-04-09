import type { TextBasedChannel } from "discord.js";
import { prisma } from "../prisma";
import type { Event } from "../type/event.type";
import { createEmbed } from "../util/embed.util";

const welcomeMessageCache: Map<string, string> = new Map();
const welcomeChannelCache: Map<string, TextBasedChannel> = new Map();

export default {
    name: "guildMemberAdd",
    once: false,

    async execute(member) {
        const guildId = member.guild.id;

        const [welcomeMessageTemplate, welcomeChannel] = await getWelcomeData(guildId, member);
        if (!welcomeChannel?.isSendable()) return;

        const welcomeMessage = replacePlaceholders(welcomeMessageTemplate, {
            "{{username}}": member.user.username,
            "{{guildName}}": member.guild.name,
            "{{memberCount}}": String(member.guild.memberCount),
            "{{user}}": `<@${member.id}>`,
            "{{accountCreationDate}}": `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`,
        });


        await welcomeChannel.send({embeds: [
            createEmbed()
                .setTitle(`🎉 Bienvenue sur ${member.guild.name}`)
                .setDescription(welcomeMessage)
        ]});
    },
} as Event<"guildMemberAdd">;

interface GuildData {
    welcomeMessageTemplate?: string | null;
    welcomeChannelID?: string | null;
}

async function getWelcomeData(
    guildId: string,
    member: import("discord.js").GuildMember
): Promise<[string, TextBasedChannel | null]> {
    let welcomeMessageTemplate: string | undefined = welcomeMessageCache.get(guildId);
    let welcomeChannel: TextBasedChannel | undefined = welcomeChannelCache.get(guildId);

    if (!welcomeMessageTemplate || !welcomeChannel) {
        const guildData: GuildData | null = await prisma.guild.findFirst({ where: { guildID: guildId } });

        welcomeMessageTemplate = guildData?.welcomeMessageTemplate || `{{username}} a rejoint l'aventure!`;
        welcomeMessageCache.set(guildId, welcomeMessageTemplate);

        if (guildData?.welcomeChannelID) {
            const fetchedChannel = await member.guild.channels.fetch(guildData.welcomeChannelID);
            if (fetchedChannel?.isTextBased()) {
                welcomeChannel = fetchedChannel;
            }
        } else {
            const systemChannel = member.guild.systemChannel;
            if (systemChannel?.isTextBased()) {
                welcomeChannel = systemChannel;
            }
        }

        if (welcomeChannel) {
            welcomeChannelCache.set(guildId, welcomeChannel);
        }
    }

    return [welcomeMessageTemplate, welcomeChannel || null];
}

function replacePlaceholders(template: string, placeholders: Record<string, string>): string {
    return template.replace(/{{\w+}}/g, (match) => placeholders[match] || match)
                   .replace(/\\n/g, '\n');
}