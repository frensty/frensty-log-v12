const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
const Jimp = require('jimp');
const { Client, Util } = require('discord.js');
const fs = require('fs');
const db = require('quick.db');
const http = require('http');
const express = require('express');
require('./util/eventLoader.js')(client);
const path = require('path');
const snekfetch = require('snekfetch');

const prefix = ayarlar.prefix;


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
    if (err) console.error(err);
    console.log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        console.log(`Yüklenen komut: ${props.help.name}.`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});




client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};




client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};


client.elevation = message => {
    if (!message.guild) {
        return;
    }
    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

client.on('emojiCreate', emoji => {
    const log = db.get(`emojilog_${emoji.guild.id}`)

    if(!log) return;

    const embed = new Discord.MessageEmbed()

    .setTitle('Bir Emoji Oluşturuldu!')
    .setColor('YELLOW')
    .addField('Emojinin Adı', emoji.name)
    .addField("Emoji ID'si", emoji.id)
    .addField('Emoji Linki', emoji.url)
    .addField('Emoji Hareketli mi', `${emoji.animated ? 'Evet, Hareketli' : 'Hayır, Hareketli Değil'}`)
    .setThumbnail(emoji.url)

    client.channels.cache.get(log).send(embed)
})

client.on('emojiDelete', emoji => {
    const log = db.get(`emojilog_${emoji.guild.id}`)

    if (!log) return;

    const embed = new Discord.MessageEmbed()

        .setTitle('Bir Emoji Silindi!')
        .setColor('RED')
        .addField('Silinen Emojinin Adı', emoji.name)
        .addField("Silinen Emoji ID'si", emoji.id)
        .addField('Silinen Emojinin Linki', emoji.url)
        .addField('Silinen Emoji Hareketli miydi', `${emoji.animated ? 'Evet, Hareketliydi' : 'Hayır, Hareketli Değildi'}`)
        .setThumbnail(emoji.url)

    client.channels.cache.get(log).send(embed)
})

client.on('emojiUpdate', (oldEmoji, newEmoji) => {
    const log = db.get(`emojilog_${oldEmoji.guild.id}`)

    if (!log) return;

    const embed = new Discord.MessageEmbed()

    .setAuthor(newEmoji.name, newEmoji.url)
    .setTitle('Bir Emoji Düzenlendi')
    .addField('Emojinin Eski Adı', oldEmoji.name)
    .addField('Emojinin Yeni Adı', newEmoji.name)
    .addField("Düzenlenen Emojinin ID'si", newEmoji.id)
    .setColor('BLURPLE')
    .setThumbnail(newEmoji.url)

    client.channels.cache.get(log).send(embed)
})

client.on('messageDelete', message => {
    const log = db.get(`mesajlog_${message.guild.id}`)

    if(!log) return;

    if(message.author.bot) return;

    const embed = new Discord.MessageEmbed()

    .setAuthor(message.author.tag, message.author.avatarURL())
    .setTitle('Bir Mesaj Silindi')
    .addField('Mesajın Silindiği Kanal:', message.channel)
    .addField('Mesajı Sahibi', message.author)
    .setColor('PURPLE')
    .addField('Silinen Mesaj', `\`\`\`${message.content}\`\`\``)
    .setThumbnail(message.author.avatarURL({dynamic:true}))

    client.channels.cache.get(log).send(embed)
})

client.on('messageUpdate', (oldMessage, newMessage) => {
    const log = db.get(`mesajlog_${oldMessage.guild.id}`)

    if (!log) return;

    if (oldMessage.author.bot) return;

    const embed = new Discord.MessageEmbed()

    .setAuthor(oldMessage.author.tag, oldMessage.author.avatarURL())
    .setTitle('Bir Mesaj Düzenlendi')
    .addField('Kanal', oldMessage.channel)
    .addField('Mesajın Sahibi', oldMessage.author)
    .addField('Eski Mesaj', `\`\`\`${oldMessage.content}\`\`\``)
    .addField('Yeni Mesaj', `\`\`\`${newMessage.content}\`\`\``)
    .setThumbnail(oldMessage.author.avatarURL({ dynamic: true }))
    .setColor('BLUE')


    client.channels.cache.get(log).send(embed)
})

client.on('channelCreate', async channel => {
    const log = db.get(`kanallog_${channel.guild.id}`)

    if (!log) return;

    let entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_CREATE' }).then(audit => audit.entries.first());

    let kanal = channel.type
    .replace('text', 'Yazı Kanalı')
    .replace('category', 'Kategori')
    .replace('voice', 'Ses Kanalı')

    const embed = new Discord.MessageEmbed()

    .setTitle('Bir Kanal Oluşturuldu')
    .addField('Kanalın Adı', channel.name)
    .addField("Kanalın ID'si", channel.id)
    .addField('Kanalı Oluşturan Kişi', entry.executor)
    .addField('Kanalın Türü', kanal)
    .setThumbnail(channel.guild.iconURL({ dynamic:true }))
    .setColor('#00b0cc')

    client.channels.cache.get(log).send(embed)
})

client.on('channelDelete', async channel => {
    const log = db.get(`kanallog_${channel.guild.id}`)

    if (!log) return;

    let entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' }).then(audit => audit.entries.first());

    let kanal = channel.type
        .replace('text', 'Yazı Kanalı')
        .replace('category', 'Kategori')
        .replace('voice', 'Ses Kanalı')

    const embed = new Discord.MessageEmbed()

        .setTitle('Bir Kanal Silindi')
        .addField('Silinen Kanalın Adı', channel.name)
        .addField("Silinen Kanalın ID'si", channel.id)
        .addField('Kanalı Silen Kişi', entry.executor)
        .addField('Silinen Kanalın Türü', kanal)
        .setThumbnail(channel.guild.iconURL({ dynamic: true }))
        .setColor('#00b0cc')

    client.channels.cache.get(log).send(embed)
})

client.on('channelUpdate', async (oldChannel, newChannel) => {
    const log = db.get(`kanallog_${oldChannel.guild.id}`)

    if (!log) return;

    let entry = await newChannel.guild.fetchAuditLogs({ type: 'CHANNEL_UPDATE' }).then(audit => audit.entries.first());

    let kanal = newChannel.type
        .replace('text', 'Yazı Kanalı')
        .replace('category', 'Kategori')
        .replace('voice', 'Ses Kanalı')

    const embed = new Discord.MessageEmbed()

        .setTitle('Bir Kanal Düzenlendi')
        .addField('Kanalın Eski Adı', oldChannel.name)
        .addField('Kanalın Yeni Adı', newChannel.name)
        .addField("Kanalın ID'si", newChannel.id)
        .addField('Kanalı Düzenleyen Kişi', entry.executor)
        .addField('Kanalın Türü', kanal)
        .setThumbnail(newChannel.guild.iconURL({ dynamic: true }))
        .setColor('#00b0cc')

    client.channels.cache.get(log).send(embed)
})

client.on('roleCreate', rol => {
    const log = db.get(`rollog_${rol.guild.id}`)

    if (!log) return;

    const embed = new Discord.MessageEmbed()

    .setTitle('Bir Rol Oluşturuldu')
    .addField('Rolün Adı', rol.name)
    .addField("Rolün ID'si", rol.id)
    .addField('Rolün Renk Kodu', rol.hexColor)
    .addField('Rolün Sırası', rol.rawPosition)
    .setThumbnail(rol.guild.iconURL({ dynamic: true }))
    .setColor('#79e200')

    client.channels.cache.get(log).send(embed)
})

client.on('roleDelete', rol => {
    const log = db.get(`rollog_${rol.guild.id}`)

    if (!log) return;

    const embed = new Discord.MessageEmbed()

        .setTitle('Bir Rol Silindi')
        .addField('Silinen Rolün Adı', rol.name)
        .addField("Silinen Rolün ID'si", rol.id)
        .addField('Silinen Rolün Renk Kodu', rol.hexColor)
        .addField('Silinen Rolün Sırası', rol.rawPosition)
        .setThumbnail(rol.guild.iconURL({ dynamic: true }))
        .setColor('#79e200')

    client.channels.cache.get(log).send(embed)
})

client.on('roleUpdate', (oldRole, newRole) => {
    const log = db.get(`rollog_${oldRole.guild.id}`)

    if (!log) return;

    const embed = new Discord.MessageEmbed()

        .setTitle('Bir Rol Düzenlendi')
        .addField('Rolün Eski Adı', oldRole.name)
        .addField('Rolün Yeni Adı', newRole.name)
        .addField("Rolün ID'si", newRole.id)
        .addField('Rolün Eski Renk Kodu', oldRole.hexColor)
        .addField('Rolün Yeni Renk Kodu', newRole.hexColor)
        .addField('Rolden Bahsedilebilir Miydi', oldRole.mentionable ? "Evet, Bahsedilebilirdi" : "Hayır, Bahsedilemezdi")
        .addField('Rolden Bahsedilebilir Mi', newRole.mentionable ? "Evet, Bahsedilebilir" : "Hayır, Bahsedilemez")
        .setThumbnail(oldRole.guild.iconURL({ dynamic: true }))
        .setColor('#79e200')

    client.channels.cache.get(log).send(embed)
})

client.on('inviteCreate', invite => {
    const log = db.get(`davetlog_${invite.guild.id}`)

    if (!log) return;

    const davet = new Discord.MessageEmbed()

    .setTitle('Bir Davet Oluşturuldu')
    .addField('Oluşturulan Davet Kodu', invite.code)
    .addField('Davet Kodunu Oluşturan Kişi', invite.inviter)
    .setColor('GREEN')
    .addField('Davetin Oluşturulduğu Kanal', invite.channel)


    client.channels.cache.get(log).send(davet)
})

client.login('TOKEN');
