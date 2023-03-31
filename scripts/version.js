const path = require('path');
const fs = require('fs-extra');

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

function getNewVersion(version){
    const argv = process.argv.slice(2);
    const versionSplit = version.split("-");
    let alpha = "";
    if(versionSplit.length > 1){
        alpha = versionSplit[1];
    }
    const currentVersionSplit = versionSplit[0].split(".");
    let major = 0;
    let minor = 0;
    let patch = 0;
    if(currentVersionSplit.length > 0){
        major = parseInt(currentVersionSplit[0]);
    }
    if(currentVersionSplit.length > 1){
        minor = parseInt(currentVersionSplit[1]);
    }
    if(currentVersionSplit.length > 2){
        patch = parseInt(currentVersionSplit[2]);
        patch++;
    }
    if(patch >= 10 && argv.indexOf("-minor") !== -1){
        patch = 0;
        minor++;
    }
    if(minor >= 10 && argv.indexOf("-major") !== -1){
        minor = 0;
        major++;
    }
    let newVersion = major+"."+minor+"."+patch;
    if(alpha.length > 0){
        newVersion += "-"+alpha;
    }
    return newVersion;
}

const packageJson = path.relative(process.cwd(), path.join("./package.json"));
const packageJsonContents = fs.readFileSync(packageJson, "utf8");
let json = JSON.parse(packageJsonContents);
json.version = getNewVersion(json.version);
const newJsonContent = JSON.stringify(json, null, 2);
fs.writeFileSync(packageJson, newJsonContent);

console.log("New version updated", json.version);