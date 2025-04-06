import { Client, Collection, GatewayIntentBits } from "discord.js"
import { readdirSync } from "fs"
import path from "path"

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const commands = new Collection<string, any>()

async function loadCommands() {
  const commandFiles = readdirSync(path.join(__dirname, "commands"))

  for (const file of commandFiles) {
    const { default: command } = await import(path.join(__dirname, "commands", file))
    if (!command) throw new Error(`Command file ${file} does not export a default module`)
    commands.set(command.data.name, command)
  }
}

async function refreshCommands() {
  const commandDatas = commands.map(c => c.data)

  if (Bun.env.ENV === "production")
    return client.application?.commands.set(commandDatas)

  const devGuild = await client.guilds.fetch(Bun.env.GUILD_ID!)
  await devGuild.commands.set(commandDatas)
}

async function bootstrap() {
  await loadCommands()

  client.once("ready", async () => {
    console.log(`connected as ${client.user?.username}`)
    await refreshCommands()
  })

  client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return
    if (!commands.has(interaction.commandName)) return

    const command = commands.get(interaction.commandName)
    if (!command) return

    command.execute(interaction).catch((err: Error) => { throw err })
  })

  await client.login(Bun.env.TOKEN)
}

bootstrap().catch(console.error)

