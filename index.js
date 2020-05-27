const Discord = require('discord.js');

const { prefix, token, minecraft } = require('./config.json')
const minecraftServer = require('./minecraftServer.js')

const client = new Discord.Client();

async function waitUntil(callback) {
  return await new Promise(resolve => {
    const interval = setInterval(async () => {
      const isOnline = await callback()
        .then(data => data.online)

      console.log('setInterval', isOnline);

      if (isOnline) {
        resolve();
        clearInterval(interval);
        console.log('clearInterval');
      };
    }, 9000);
  });
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message  => {
  if (message.content.startsWith(`${prefix}help`)) {
    message.channel.send(`
      !ip     - Donne l'ip du server
      !status - Donne le status sur server (Ouvert ou Fermé)
    `)
  }

  if (message.content.startsWith(`${prefix}ip`)) {
    message.channel.send(`Minecraft Server Address: ${minecraft.api}`)
  }

  if (message.content.startsWith(`${prefix}status`)) {
    const messageEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Status du server Minecraft')
      .setDescription('En cours de récupération...')
      .setTimestamp()

    const botMessage = await message.channel.send(messageEmbed)

    await minecraftServer.getServerStatus()
      .then(data => {
        if(data.online) {
          messageEmbed.color = "#2DDFB2"
          messageEmbed.description = `
          Le server est ouvert !\u200B
          \u200B
          Il y a **${data.players.now}/${data.players.max}** joueur(s) connecté\u200B
          Adresse du server: \`${minecraft.ip}\`
          `
          
          botMessage.edit(messageEmbed)
        } else {
          messageEmbed.color = "#ECA539"
          messageEmbed.description = `
          Désolé, le server est fermé.\u200B
          \u200B
          Tu peux lancer le server avec la commande \`!startServer\`
          `
          
          botMessage.edit(messageEmbed)
        }
      })
      .catch(err => {
        messageEmbed.color = "#BF213E"
        messageEmbed.description = "Il y a eu une erreur, vas te plaindre à Vincent \u200B\u200B" + err
        
        botMessage.edit(messageEmbed)
      })
  }

  if (message.content.startsWith(`${prefix}startServer`)) {
    const messageEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Server Minecraft')
      .setDescription(`Lancement du server minecraft par ${message.author}...`)
      .setTimestamp()

    const botMessage = await message.channel.send(messageEmbed)
    // Start Server
    minecraftServer.start()
      .then(() => {
        console.log('LE SERVER EST STORPED');
        
        messageEmbed.color = "#ECA539"
        messageEmbed.description = `Le server à été stoppé, tu peux le relancer avec la commande \`!startServer\``
        
        botMessage.edit(messageEmbed)
      })

    // Check server status to update discord message
    setTimeout(async () => {
      await waitUntil(minecraftServer.getServerStatus)
      .then(() => {
        messageEmbed.color = "#2DDFB2"
        messageEmbed.description = `
        Le server est ouvert ! tu peux te **connecter** !\u200B
        \u200B
        Adresse du server: \`${minecraft.ip}\`
        `
        
        botMessage.edit(messageEmbed)
      })
    }, 10000);
  }
})

client.login(token);