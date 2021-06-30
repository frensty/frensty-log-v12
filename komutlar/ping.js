const Discord = require("discord.js")

exports.run = async (client, message, args) => {
    const zykaaal = new Discord.MessageEmbed()
    .setAuthor(message.author.username, message.author.avatarURL())
    .setDescription(`**Pingim:** ${client.ws.ping}`)

    message.channel.send(zykaaal)

}


exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['ping','ping'],
    permLevel: 0
  };
  
  exports.help = {
    name: 'ping'
  };
