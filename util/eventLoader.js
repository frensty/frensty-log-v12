let anan = (event) => require(`../events/${event}`)

module.exports = client => {
    client.on('ready', () => anan('ready')(client));
    client.on('message', anan('message'));
}
