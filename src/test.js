const path = require('path')
const fs = require('fs')
const os = require('os');

let file = fs.readFileSync(path.join(os.homedir(), "AppData", "Roaming", "Slippi Launcher", "Settings"))
let json = JSON.parse(file)
console.log(json.settings.rootSlpPath)