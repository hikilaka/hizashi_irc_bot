const bson = require('bson');
const net = require('net');
const EventEmitter = require('events');

class HizashiClient extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.socket = new net.Socket();
        this.socket.setTimeout(this.config.client.socketTimeout);
        hookListeners(this);
    }
    connect(done) {
        this.socket.connect(this.config.client.port, this.config.client.server, done);
    }
    writeEvent(event) {
        let buffer = new bson.BSON().serialize(event);
        this.socket.write(buffer);
    }
    action(target, message) {
        this.writeEvent({
            type: 'action',
            target: target,
            message: message
        });
    }
    invite(nick, channel) {
        this.writeEvent({
            type: 'invite',
            nick: nick,
            channel: channel
        });
    }
    join(channel, key) {
        this.writeEvent({
            type: 'join',
            channel: channel,
            key: key
        });
    }
    kick(channel, nick, message) {
        this.writeEvent({
            type: 'kick',
            channel: 'channel',
            nick: nick,
            message: message
        });
    }
    message(target, message) {
        this.writeEvent({
            type: 'message',
            target: target,
            message: message
        });
    }
    nick(nick) {
        this.writeEvent({
            type: 'nick',
            nick: nick
        });
    }
    notice(target, message) {
        this.writeEvent({
            type: 'notice',
            target: target,
            message: message
        });
    }
    part(channel, message) {
        this.writeEvent({
            type: 'part',
            channel: channel,
            message: message
        });
    }
    quit(message) {
        this.writeEvent({
            type: 'quit',
            message: message
        });
    }
    topic(channel, topic) {
        this.writeEvent({
            type: 'topic',
            channel: channel,
            topic: topic
        });
    }
}

function hookListeners(client) {
    client.socket.on('close', hadError => client.emit('close', hadError));
    client.socket.on('connect', () => client.emit('connect'));
    client.socket.on('data', data => {
        try {
            let event = new bson.BSON().deserialize(data);

            if (event.type === 'privmsg' || event.type === 'notice') {
                event.reply = message => client.message(event.target, message);
            }
            client.emit(event.type, event);
        } catch (e) {
            console.error(e);
        }
    });
    client.socket.on('error', error => client.emit('error', error));
    client.socket.on('timeout', () => client.emit('timeout'));
}

module.exports.HizashiClient = HizashiClient;
