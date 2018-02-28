const fs = require('fs'),
    network = require('./network'),
    config = require('./config'),
    serverConfig = require('../config');

let client = new network.client.HizashiClient(config);

function joinChannelPersist(channel, key) {
    client.join(channel, key);
    
    if (key !== undefined) {
        channel = `${channel}:${key}`;
    }

    if (serverConfig.irc.channels.includes(channel)) {
        return;
    }

    serverConfig.irc.channels.push(channel);

    const string = JSON.stringify(serverConfig, null, 4);

    fs.writeFile('config.json', string, 'utf8', err => {
        if (err) {
            console.error(err);
        }
    });
}

client.on('privmsg', event => {
    const match = event.message.match(/^!join #(.+) ?(.+)?$/i);

    if (match === null) {
        return;
    }

    const channel = `#${match[1]}`
    const key = match[2];

    console.log(`invited to ${channel} by ${event.nick}`);    
    joinChannelPersist(channel, key);
});

client.on('invite', event => {
    console.log(`invited to ${event.channel} by ${event.nick}`);
    joinChannelPersist(event.channel);
});

client.on('error', error => console.error(error));

client.connect(() => {
    console.log('connected to server');
});
