const irc = require('irc-framework');

class HizashiClient {
    constructor(config, vconsole) {
        this.config = config;
        this.console = vconsole || console;
        this.bot = new irc.Client();
        // TODO: use middleware for nickserv verification

        // registered needs to be handled by this object in order
        // to join channels & verify w/ nickserv
        this.bot.on('registered', () => {
            this.console.log('registered on network');

            if (this.connectHandler) {
                this.connectHandler();
            }
        
            let nickserv = config.irc.nickserv;
        
            if (nickserv) {
                this.bot.say('nickserv', `identify ${nickserv}`);
                this.console.log('identified with nickserv');
            }
        
            let channels = config.irc.channels;
        
            if (channels && Array.isArray(channels)) {
                channels.forEach(channel => this.bot.join(channel));
                this.console.log(`joined ${channels.length} channel[s]`);
            }
        });
    }
    connect(connectHandler) {
        this.connectHandler = connectHandler;
        this.bot.connect(this.config.irc);
    }
    catchAllEvents(handler) {
        addEventListeners(this.bot, handler);
    }
    handleResponse(event) {
        switch (event.type) {
            case 'action':
                this.bot.action(event.target, event.message);
                break;
            case 'invite':
                this.bot.rawString('invite', event.nick, event.channel);
                break;
            case 'join':
                this.bot.join(event.channel, event.key);
                break;
            case 'kick':
                this.bot.rawString('kick', event.channel, event.nick, event.message);
                break;
            case 'message':
                this.bot.say(event.target, event.message);
                break;
            case 'nick':
                this.bot.changeNick(event.nick);
                break;
            case 'notice':
                this.bot.notice(event.target, event.message);
                break;
            case 'part':
                this.bot.part(event.channel, event.message);
                break;
            case 'quit':
                this.bot.quit(event.message);
                break;
            case 'topic':
                this.bot.setTopic(event.channel, event.topic);
                break;
        }
    }
}

function addEventListeners(bot, handler) {
        // The client has disconnected from the network and will now automatically re-connect (if enabled).
        bot.on('reconnecting', () => handler({
            type: 'reconnecting'
        }));

        // The client has disconnected from the network and failed to auto reconnect (if enabled).
        bot.on('close', () => handler({
            type: 'close'
        }));

        bot.on('userlist', event => handler({
            type: 'userlist',
            channel: event.channel,
            users: event.users
        }));

        bot.on('wholist', event => handler({
            type: 'wholist',
            channel: event.target,
            users: event.users
        }));

        bot.on('banlist', event => handler({
            type: 'banlist',
            channel: event.channel,
            users: event.bans
        }));

        bot.on('topic', event => handler({
            type: 'topic',
            channel: event.channel,
            topic: event.topic,
            nick: event.nick,
            time: event.time
        }));

        bot.on('join', event => handler({
            type: 'join',
            nick: event.nick,
            ident: event.ident,
            hostname: event.hostname,
            realname: event.gecos,
            channel: event.channel,
            time: event.time
        }));

        bot.on('part', event => handler({
            type: 'part',
            nick: event.nick,
            ident: event.ident,
            hostname: event.hostname,
            channel: event.channel,
            message: event.message,
            time: event.time
        }));

        bot.on('kick', event => handler({
            type: 'kick',
            who: event.kicked,
            by: event.nick,
            ident: event.ident,
            hostname: event.hostname,
            channel: event.channel,
            message: event.message,
            time: event.time
        }));

        bot.on('quit', event => handler({
            type: 'quit',
            nick: event.nick,
            ident: event.ident,
            hostname: event.hostname,
            message: event.message,
            time: event.time
        }));

        bot.on('invite', event => handler({
            type: 'invite',
            nick: event.nick,
            channel: event.channel
        }));
        
        bot.on('message', event => handler(event));

        bot.on('nick', event => handler({
            type: 'nick',
            nick: event.nick,
            ident: event.ident,
            hostname: event.hostname,
            newNick: event.new_nick,
            time: event.time
        }));

        bot.on('action', event => handler({
            type: 'action',
            nick: event.nick,
            ident: event.ident,
            hostname: event.hostname,
            target: event.target,
            message: event.message,
            time: event.time
        }));
        
        bot.on('error', error => {
            console.error(error);
        });
}

module.exports.HizashiClient = HizashiClient;
