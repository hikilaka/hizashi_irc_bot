const blessed = require('blessed');

class VirtualConsole {
    constructor(screen, options) {
        this.screen = screen;
        this.box = blessed.box({ parent: screen, ...options });
    }

    log(object) {
        this.box.pushLine(object.toString());
        this.box.scroll(1);
        this.screen.render();
    }

    error(object) {
        this.box.pushLine(object.toString());
        this.box.scroll(1);
        this.screen.render();
    }
}

module.exports = VirtualConsole;
