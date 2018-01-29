const network = require('./network');
const config = require('./config');
const names = require('./names').names;

let client = new network.client.HizashiClient(config);

function randomName() {
    return names[Math.floor(Math.random()*names.length)];
}

client.on('privmsg', event => {
    let match = event.message.match(/^!name( [1-9])?$/i);

    if (match) {
        if (match[1]) {
            let count = +match[1];
            let output = '';

            for (let i = 0; i < count; i += 1) {
                output += randomName() + ', ';
            }

            event.reply(output.substring(0, output.length - 2));
        } else {
            event.reply(randomName());
        }
    }
});

client.on('error', error => console.error(error));

client.connect(() => {
    console.log('connected to server');
});
