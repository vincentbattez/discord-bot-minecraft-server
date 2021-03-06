const Discord = require('discord.js');

const { prefix, token, minecraft } = require('./config.json')
const color = require('./colors.js')
const { waitUntil } = require('./utils.js')

const minecraftServer = require('./minecraftServer.service.js')
const MinecraftServerService = new minecraftServer.MinecraftServerService()

const bot = new Discord.Client();

// Connect Discord Bot
bot.login(token);

// On bot ready
bot.once('ready', () => {
  console.log("----- Bot ready to listen messages on discord !");
});

// Message on discord
bot.on('message', async message  => {
  // !help
  if (message.content.startsWith(`${prefix}help`)) {
    message.channel.send(`
prefix: \`!\`\u200B
\u200B
\`help\` - Donne la liste des commandes\u200B
\`status\` - Donne le status sur serveur (Ouvert ou Fermé)\u200B
\`startServer\` - Lance le serveur
    `)
  }

  // !stop
  // if (message.content.startsWith(`${prefix}stop`)) {
  //   MinecraftServerService.process.stdin.write('stop\n');
  // }

  // !status
  if (message.content.startsWith(`${prefix}status`)) {
    const messageEmbed = new Discord.MessageEmbed()
      .setColor(color.info)
      .setTitle('Status du serveur Minecraft')
      .setDescription('En cours de récupération...')
      .setTimestamp()

    // send message
    const botMessage = await message.channel.send(messageEmbed)

    await MinecraftServerService.getStatus()
      .then(data => {
        messageEmbed.color = color.success
        messageEmbed.description = `
        Le serveur est ouvert !\u200B
        \u200B
        Il y a **${data.onlinePlayers}/${data.maxPlayers}** joueur(s) connecté\u200B
        Adresse du serveur: \`${data.host}\`
        `
        // edit message
        botMessage.edit(messageEmbed)
      })
      .catch(err => {
        console.log(err);
        
        messageEmbed.color = color.warning
        messageEmbed.description = `
        Désolé, le serveur est fermé.\u200B
        \u200B
        Tu peux lancer le serveur avec la commande \`!startServer\`
        `
        
        // edit message
        botMessage.edit(messageEmbed)
      })
  }

  // !startServer
  if (message.content.startsWith(`${prefix}startServer`)) {
    const messageEmbed = new Discord.MessageEmbed()
      .setColor(color.info)
      .setTitle('Serveur Minecraft')
      .setDescription(`
      Lancement du serveur minecraft par ${message.author}...\u200B
      \u200B
      Il faut en moyenne 15s pour lancer le serveur
      `)
      .setTimestamp()

    // send message
    const botMessage = await message.channel.send(messageEmbed)

    // Start Server
    MinecraftServerService.start({
      onDisconnect: () => {},
      onError: () => {
        messageEmbed.color = color.danger
        messageEmbed.description = `Il y a eu un problème avec le lancement du serveur. Vas te plaindre à Vincent`
        
        // edit message
        botMessage.edit(messageEmbed)
      },
      onClose: () => {
        messageEmbed.color = color.warning
        messageEmbed.description = `Le serveur à été stoppé, tu peux le relancer avec la commande \`!startServer\``
        
        // edit message
        botMessage.edit(messageEmbed)
      }
    })    

    // Check server status to update discord message
    setTimeout(async () => {
      await waitUntil(MinecraftServerService.getStatus)
        .then(() => {
          messageEmbed.color = color.success
          messageEmbed.description = `
          Le serveur est ouvert ! tu peux te **connecter** !\u200B
          \u200B
          Adresse du serveur: \`${minecraft.ip}\`
          `
          
          // edit message
          botMessage.edit(messageEmbed)
        })
    }, 15000);
  }
})