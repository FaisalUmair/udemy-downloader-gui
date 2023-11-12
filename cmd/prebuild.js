const fs = require('fs');

console.log("%c.:: UPDATING VERSION", "color: #007acc;");

let pkgJson = JSON.parse(fs.readFileSync('package.json', 'utf-8').toString());
let version = pkgJson.version.split(".");
const lastIndex = version.length - 1;

version[lastIndex] = parseInt(version[lastIndex]) + 1;
// trata o formato: 1 -> 2.0.0 | 1.1 -> 1.2.0 | 1.1.1 -> 1.1.2
pkgJson.version = version.join(".") + (lastIndex <= 1 ? ".0".repeat(3 - (lastIndex + 1)) : "");

fs.writeFileSync('package.json', JSON.stringify(pkgJson, null, "\t"), 'utf-8');

console.log("%c.:: NEW VERSION ->", "color: white; background-color: #007acc;", pkgJson.version);  
