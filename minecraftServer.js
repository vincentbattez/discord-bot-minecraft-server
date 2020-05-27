const axios = require('axios');
const { exec } = require("child_process");
const { minecraft } = require('./config.json')

module.exports = {
  start: () => {
    console.log('start server...')

    return new Promise((resolve, reject) => {
      exec("sh ./scripts/startServerMinecraft.sh", (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          reject(error)
          return;
        }

        if (stderr) {
          console.log(`stderr: ${stderr}`);
          reject(stderr)
          return;
        }

        resolve(stdout)
        console.log(`stdout: ${stdout}`);
      });
    })
  },
  getServerStatus: () => {
    console.log('getServerStatus');
    
    return axios
      .get(minecraft.api)
      .then(response => response.data)
  }
}