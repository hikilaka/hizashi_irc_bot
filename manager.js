const blessed = require('blessed'),
    colors = require('colors'),
    bson = require('bson');

const config = require('./config'),
    service = require('./service'),
    irc = require('./irc'),
    network = require('./network'),
    VirtualConsole = require('./virtual_console');


const screen = blessed.screen({
    smartCSR: true,
    autoPadding: true
});

screen.title = config.manager.ui.title;

const pane = blessed.box(config.manager.ui.pane),
    list = blessed.list(config.manager.ui.services),
    vconsole = new VirtualConsole(screen, config.manager.ui.console),
    status = blessed.box(config.manager.ui.status),
    commandsBox = blessed.box(config.manager.ui.commands),
    prompt = blessed.prompt({
        parent: screen,
        ...config.manager.ui.prompt
    });

// load services & constuct a manager for them
const services = service.load(config)
    .map(s => new service.HizashiService(s, vconsole));

const manager = new service.HizashiServiceManager(services, list, vconsole);

// important to hook the exit event, otherwise the running
// services will continue to run independently in the background
process.on('exit', () => manager.killAll());

// create ui hierarchy 
pane.append(list);
pane.append(status);
pane.append(commandsBox);
pane.append(vconsole.box);

screen.append(pane);
screen.append(prompt);

const states = [
    'state: ' + 'disconnected'.red,
    'server: ' + config.irc.host.yellow,
    'nick: ' + config.irc.nick.cyan,
    'channels: ' + config.irc.channels.map(c => c.magenta).join(', ')
];

// TODO: maybe generate this dynamically or from a config file
const commands = [
    'l = load',
    'k = kill',
    'r = restart',
    's = load all',
    'x = kill all',
    'i = connect irc',
    'n = change nick',
    'ESC = quit'
];

// populate the service, status, and command fields
services.forEach(service => list.pushItem('[idle] '.yellow + service.name));
states.forEach(state => status.pushLine(state));
commands.forEach(command => commandsBox.pushLine(command));

// handles quitting
screen.key(['escape', 'q', 'C-c'], (ch, key) => {
    const running = services.some(service => service.isRunning());

    if (running) {
        prompt.input('Are you sure you want to quit?', '', (err, val) => {
            if (val === null || err !== null) {
                prompt.hidden = true;
                screen.render();
                return;
            }
            val = val.trim().toLowerCase();

            if (val === 'y' || val === 'yes') {
                process.exit(0);
            }
        });
    } else {
        process.exit(0);
    }
});

// handles all other key input
screen.key(['l', 'k', 'r', 's', 'x', 'n'], (ch, key) => {
    switch (ch) {
    case 'l': // load
        manager.load(list.selected);
        break;
    case 'k': // kill
        manager.kill(list.selected);
        break;
    case 'r': // restart
        manager.restart(list.selected);
        break;
    case 's': // load all
        manager.loadAll();
        break;
    case 'x': // kill all
        manager.killAll();
        break;
    case 'n': // nick
        prompt.input('Enter new nickname', '', (err, val) => {
            if (val === null || err != null) {
                prompt.hidden = true;
                screen.render();
                return;
            }
            val = val.trim();

            vconsole.log(`changing nice to ${val}`);
            bot.handleResponse({ type: 'nick', nick: val });
        });
        break;
    }
});

// don't allow other components to gain focus
vconsole.box.on('focus', () => list.focus());
status.on('focus', () => list.focus());
commandsBox.on('focus', () => list.focus());

// focus the service list & render
list.focus();
screen.render();

// create bot & server instances
const bot = new irc.client.HizashiClient(config, vconsole);
const server = new network.server.HizashiServer(config);

bot.catchAllEvents(event => {
    const encoded = new bson.BSON().serialize(event);
    server.sendToSubscribers(encoded);
});

server.catchAllResponses(response => {
    const decoded = new bson.BSON().deserialize(response);
    bot.handleResponse(decoded);
});

server.start(() => {
    vconsole.log('server online -- now accepting connections');
    status.setLine(0, 'state: ' + 'connected'.green);
    bot.connect();
});
