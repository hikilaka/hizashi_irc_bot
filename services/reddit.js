/**
 * Posts youtube urls to reddit from a specific user
 */

const network = require('./network'),
    config = require('./config'),
    snoowrap = require('snoowrap'),
    c = require('irc-colors');

const client = new network.client.HizashiClient(config);
const r = new snoowrap(config.services.reddit);
const baseUrl = `https://reddit.com/r/${config.services.reddit.subreddit}/`;

client.on('error', error => console.error(error));

client.on('privmsg', event => {
    event.message = c.stripColorsAndStyle(event.message);

    const match = event.message.match(/^\(Sussess\) for \((.+)\): (.+)$/i);

    if (!match || event.nick !== config.services.reddit.obverser) {
        return;
    }

    r.getSubreddit(config.services.reddit.subreddit).submitLink({
        title: match[1],
        url: match[2],
        sendReplies: false
    }).then(submission => {
        event.reply(c.green('[sussess]') +' posted to reddit: '
            + baseUrl + submission.name.substr(submission.name.indexOf('_')+1));
    }).catch(error => {
        event.reply(`Error posting to submission to reddit: ${error}`);
    });
});

client.connect(() => {
    console.log('connected to server');
});
