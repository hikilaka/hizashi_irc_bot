/**
 * queries wolfram alpha--current work in progress
 */

const fs = require('fs'),
    c = require('irc-colors'),
    wolfram_alpha = require('wolfram-alpha'),
    network = require('./network'),
    config = require('./config');

const client = new network.client.HizashiClient(config);
const wolfram = wolfram_alpha.createClient(config.services.wolfram.appKey);

client.on('privmsg', event => {
    let match = event.message.match(/^!calc (.+)$/i);

    if (match === null) {
        return;
    }

    match = match[1].trim();

    if (match.length === 0) {
        return;
    }

    wolfram.queryCb(match, (err, results) => {
        if (err) {
            event.reply('wolfram alpha error, see console');
            return console.error(`Error in query: ${err}`);
        }

        console.log(results);

        if (results === null || results.length === 0) {
            return event.reply(`no answer found for "${c.bold(match)}"`);
        }

        let input = results.find(result => result.title === 'Input'),
            primary = results.find(result => result.primary);

        if (!input) {
            input = { subpods: [ { text: match } ] };
        }
        if (!primary) {
            return event.reply(`no answer found for "${c.bold(match)}"`);            
        }

        if (input.subpods.length == 0 || primary.subpods.length == 0) {
            return event.reply(`no answer found for "${c.bold(match)}"`);            
        }

        input = input.subpods[0].text;

        const response = `${c.green('[')}${c.bold(primary.title)}${c.green(']')} ${input} = ${primary.subpods[0].text}`;

        event.reply(`${c.bold(response)}. Find the full solution at http://www.wolframalpha.com/input/?i=${encodeURIComponent(input)}`);
    });
});

client.on('error', error => console.error(error));

client.connect(() => {
    console.log('connected to server');
});
