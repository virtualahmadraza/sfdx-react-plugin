const path = require('path');
const fs = require('fs-extra');
const gitclone = require('git-clone');
const rm = require('rimraf').sync;

async function getRootPath(): Promise<string>{
    let projectRoot = __dirname;
    while (projectRoot.length >= 0) {
        try {
            const projectJsonPath = path.join(projectRoot, 'package.json');
            const sfProjectJsonPath = path.join(projectRoot, 'sfdx-project.json');
            let projectFilePath = projectJsonPath;
            if(fs.existsSync(sfProjectJsonPath)){
                projectFilePath = sfProjectJsonPath;
            }
            fs.statSync(projectFilePath);
            break;
        }
        catch (err) {
            if (err.code !== 'ENOENT')
                throw err;
            projectRoot = projectRoot.substring(0, projectRoot.lastIndexOf(path.sep));
        }
    }
    return projectRoot;
}

function download(folder: string, flags: object, cb: any): void{
    const repository = flags['repository'];
    const repositoryArray = repository.split("/");
    let repositoryName = repository;
    if(repositoryArray.length > 1){
        repositoryName = repositoryArray[1];
    }
    const destination = path.join(folder, repositoryName);
    if (fs.existsSync(destination)){
        return cb();
    }

    const branch = flags['branch'];
    const opts = {
        checkout: branch,
        clone: true
    };
    var cloneOptions = {
        checkout: branch,
        shallow: (branch === 'master' || branch === 'main'),
        ...opts
    }
    const url = "https://github.com/"+repository;
    gitclone(url, destination, cloneOptions, function (err) {
        if (err === undefined) {
            rm(destination + '/.git', {});
            cb();
        } else {
            throw err;
        }
    });
}

export { getRootPath, download };