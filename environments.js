const fs = require('fs');

const envFile = fs.readFileSync(`${__dirname}/.env`, 'utf-8').toString();
const envVars = envFile.split("\n")

for (let index = 0; index < envVars.length; index++) {
    const el = envVars[index].split("=");
    if (el.length > 1) {
        process.env[el[0]] = el[1];
    }    
}

// console.log(process.env)
