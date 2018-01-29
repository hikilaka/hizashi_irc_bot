const crypto = require('crypto');
const net = require('net');

class Session {
    constructor(server, socket) {
        this.server = server;
        this.socket = socket;
        this.socket.setTimeout(server.config.server.socketTimeout);
        this.updateIdentifier();
        this.hookListeners();
    }
    write(buffer) {
        this.socket.write(buffer);
    }
    updateIdentifier() {
        const sha512 = crypto.createHash('sha512');
        sha512.update(this.socket.remoteAddress + Date.now());
        this.identifier = sha512.digest('hex');
    }
    hookListeners() {
        this.socket.on('data', data => this.server.dataHandler(data));
        this.socket.on('close', () =>
            this.server.removeSession(this.identifier));
        this.socket.on('error', err => console.error('session error', err));
    }
}

class HizashiServer {
    constructor(config) {
        this.config = config;
        this.sessions = new Map();
        this.dataHandler = () => {};
    }
    listen(done) {
        this.server = net.createServer(socket => {
            const session = new Session(this, socket);
            this.sessions.set(session.identifier, session);
        });
        this.server.maxConnections = this.config.server.maxConnections;
        this.server.listen(this.config.server.port, this.config.server.hostname, done);
    }
    start(done) {
        this.listen(err => {
            if (err) return done(err);
            done();
        });
    }
    removeSession(identifier) {
        const session = this.sessions.get(identifier);
        if (!session) return;
        this.sessions.delete(identifier);
    }
    sendToSubscribers(buffer) {
        for (let session of this.sessions.values()) {
            session.write(buffer);
        }
    }
    catchAllResponses(handler) {
        this.dataHandler = handler;
    }
}

module.exports.HizashiServer = HizashiServer;
