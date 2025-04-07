export const XP_RATES = {
  DEAFENED: 10,
  MUTED: 20,
  ACTIVE: 30,
  LEVEL_MULTIPLIER: 0.1,
};

export const CHANNEL_IDS = {
  PERSONAL_CATEGORY: "1356040928355160159",
  CUSTOM_CHANNEL_MESSAGE: "1358443952419766273",
};

export const ENV = {
  TOKEN: process.env.TOKEN || "",
  GUILD_ID: process.env.GUILD_ID || "",
  ENVIRONMENT: process.env.NODE_ENV || "development",
};
