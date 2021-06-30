const Discord = require("discord.js")
const db = require('quick.db')
const { MessageEmbed } = require('discord.js')

exports.run = async (client, message, args) => {
    if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`Bu Komutu Kulannamk İçin Yönetici Yetkisine Sahip Olmalısın!`)

    if (!args[0]) return message.channel.send('**Lütfen Bir Davet Log Kanalı Belirtin!**');

    if (args[0] !== "sıfırla") {

        const log = message.mentions.channels.first() || message.guild.channels.cache.find(k => k.id === args[0])

        if (!log) return message.channel.send('**Böyle Bir Kanalı Bulamadım!!**');

        if (log.type === "voice") return message.channel.send('Lütfen Bir Yazı Kanalı Belirtin!');

        else {
            db.set(`davetlog_${message.guild.id}`, log.id)

            const embed = new MessageEmbed()

                .setTitle('Başarılı')
                .setDescription(`Mesaj Log Kanalı Başarıyla ${log} Olarak Ayarlandı!`)
                .setFooter('Sıfırlamak İçin o!davet-log sıfırla')
                .setColor('GREEN')

            return message.channel.send(embed)
        }
    }

    if (args[0] === "sıfırla") {
        db.delete(`davetlog_${message.guild.id}`)

        return message.channel.send(
            new MessageEmbed()
                .setTitle('Başarılı')
                .setDescription(`**Davet Log Kanalı Başarıyla Sıfırlandı!**`)
                .setColor('GREEN')
        )
    }
}

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["davetlog"]
};

exports.help = {
    name: "davet-log"
}