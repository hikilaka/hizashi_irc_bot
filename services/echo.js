const network = require('./network');
const config = require('./config');
const setRandomizedInterval = require('randomized-interval');

let client = new network.client.HizashiClient(config);

function randomPrefix() {
    let responses = [
        'ye ', 'ya ', 'ayo hol up ', 'hol up ', '', ''
    ];
    return responses[(Math.floor(Math.random()*responses.length))];
}

function randomPostfix() {
    let responses = [
        'af', 'as fuck', 'as shit',
        'nigguh', 'nikka', 'bitch',
        '', ''
    ];
    return responses[(Math.floor(Math.random()*responses.length))];
}

function randomAction() {
    let actions = [
        'smacks lips',
        'hits blunt',
        'huffs jankem'
    ];
    return actions[Math.floor(Math.random() * actions.length)];
}

client.on('privmsg', event => {
    let output = '';
    let match = event.message.match(/shi+e+t+/i);

    if (match) {
        output += match[0] + ' ';
    }

    match = event.message.match(/(d|th)at?s ra(cist|ysis)/i);

    if (match) {
        if (output.length > 0) {
            output = output.substring(0, output.length - 1);
            output += ', ' + randomPrefix() ;
        } else {
            output += randomPrefix();
        }
        output += match[0];
        output += ' ' + randomPostfix();
        event.reply(output);
        return;
    }

    match = event.message.match(/(d|th)at?s ri(ght|te)/i);

    if (match) {
        if (output.length > 0) {
            output += ' ';
        }
        output += match[0];
    }

    if (output.length > 0) {
        event.reply(output);
    }
});

client.on('error', error => console.error(error));

client.connect(() => {
    console.log('connected to server');

    setRandomizedInterval(() => {
        client.action('#trollhour', randomAction());
    }, 6 * 60 * 60 * 1000); // 6 hours
});

