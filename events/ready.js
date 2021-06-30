const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

var prefix = ayarlar.prefix;

module.exports = client => {
    client.user.setStatus("idle")
    client.user.setActivity(`Frénsty ❤️ OrésCode`, {type: "LISTENING"})
};
