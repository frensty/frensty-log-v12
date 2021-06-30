const Discord = require("discord.js")

exports.run = async (client, message, args) => {
    const zykaaal = new Discord.MessageEmbed()
    .setAuthor(message.author.username, message.author.avatarURL())
    .setDescription(`https://discord.gg/7hQydhURbX`)
    .setFooter(`Developed by zykaaal.`)

    message.channel.send(zykaaal)


}


exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['tigacode','tiga'],
    permLevel: 0
  };
  
  exports.help = {
    name: 'tiga'
  };
