const colors = require('chalk');

function handleStart(manager, service, index) {
    manager.list.setItem(index, `${colors.green('[running]')} ${service.name}`);    
    manager.console.screen.render();
}

function handleStop(manager, service, index) {
    manager.list.setItem(index, `${colors.yellow('[idle]')} ${service.name}`);
    manager.console.screen.render();
}

class HizashiServiceManager {
    constructor(services, list, vconsole) {
        this.services = services;
        this.list = list;
        this.console = vconsole;
    }

    load(index) {
        if (index < 0 || index >= this.services.length) {
            return;
        }

        const service = this.services[index];

        handleStart(this, service, index);
        service.start(() => handleStop(this, service, index));
    }

    kill(index) {
        if (index < 0 || index >= this.services.length) {
            return;
        }

        const service = this.services[index];

        service.stop();
    }

    restart(index) {
        this.kill(index);
        this.load(index);
    }

    loadAll() {
        this.services.forEach((service, index) => this.load(index));
    }

    killAll() {
        this.services.forEach((service, index) => this.kill(index));
    }

    isRunning() {
        return this.services.some(service => service.isRunning());
    }
}

module.exports.HizashiServiceManager = HizashiServiceManager;
