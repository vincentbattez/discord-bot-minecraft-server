const { spawn } = require("child_process");
const { minecraft } = require('./config.json')
const ping = require('minecraft-server-util');

class MinecraftServerService {
  constructor() {
    this.process = null
  }
  
  start({onDisconnect, onError, onClose}) {
    console.log('start server...')

    this.process = spawn("sh" , ["./scripts/startServerMinecraft.sh"], {
      stdio: 'inherit',
      shell: true
    })
    .on('disconnect', onDisconnect)
    .on('error', onError)
    .on('close', onClose)
  }

  getStatus() {
    console.log('ping server');

    return ping(minecraft.ip, minecraft.port)
  }
}

module.exports = {
  MinecraftServerService
}