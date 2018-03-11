const { spawn } = require('child_process'),
    colors = require('chalk'),
    { which } = require('shelljs');

const config = require('../config');

class HizashiService {
    constructor(file, vconsole) {
        this.name = file.replace('.js', '').split('/').slice(-1).pop();
        this.file = file;
        this.console = vconsole;
    }

    start(closeListener) {
        if (this.isRunning()) {
            return;
        }

        const nodePath = which('node')
        const nodeExecutable = nodePath ? nodePath.stdout : config.manager.nodeExecutable
        
        this.process = spawn(nodeExecutable, [this.file]);
        this.process.stdout.on('data', data =>
            this.console.log(colors.green('[') + this.name + colors.green('] ') 
                + data.toString().trim()));
        this.process.stderr.on('data', data =>
            this.console.log(colors.red('[') + this.name + colors.red('] ')
                + data.toString().trim()));
        this.process.on('close', closeListener);
    }

    stop() {
        if (!this.isRunning()) {
            return;
        }
        this.process.kill('SIGKILL');
        delete this.process;
    }

    restart(closeListener) {
        this.stop('SIGKILL');
        this.start(closeListener);
    }

    isRunning() {
        return this.hasOwnProperty('process');
    }
}

module.exports.HizashiService = HizashiService;
