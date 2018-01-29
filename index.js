const bson = require('bson');
const irc = require('./irc');
const network = require('./network');
const config = require('./config');

let bot = new irc.client.HizashiClient(config);
let server = new network.server.HizashiServer(config);

bot.catchAllEvents(event => {
    let encoded = new bson.BSON().serialize(event);
    server.sendToSubscribers(encoded);
});

server.catchAllResponses(response => {
    let decoded = new bson.BSON().deserialize(response);
    bot.handleResponse(decoded);
});

server.start(() => {
    bot.connect();
});
