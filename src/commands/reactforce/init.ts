import * as os from 'os';
import { SfdxCommand, flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { getRootPath, download } from "../../utils/helper";
const path = require('path');
const fs = require('fs-extra');
const util = require('util');
const downloadGit = util.promisify(download);

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

const messages = Messages.loadMessages('sfdx-react-plugin', 'init');

export default class ReactforceInit extends SfdxCommand {
    public static description = messages.getMessage('commandDescription');
    public static examples = messages.getMessage('examples').split(os.EOL);

    static flagsConfig = {
        'static-resources': flags.string({
            char: 's',
            description: messages.getMessage('staticResourcesFlagDesc'),
            default: '/force-app/main/default/staticresources'
        }),
        'repository': flags.string({
            char: 'r',
            description: messages.getMessage('repositoryFlagDesc'),
            default: 'cloudpremise/reactforce-assets'
        }),
        'branch': flags.string({
            char: 'b',
            description: messages.getMessage('branchFlagDesc'),
            default: 'main'
        }),
    }
    private async cloneTemplate(reactforceFolder: string, flags: object): Promise<string> {
        const repository = flags['repository'];
        const repositoryArray = repository.split("/");
        let repositoryName = repository;
        if(repositoryArray.length > 1){
            repositoryName = repositoryArray[1];
        }
        const destination = path.join(reactforceFolder, repositoryName);
        if (fs.existsSync(destination)){
            this.ux.log(messages.getMessage('respositoryAlreadyCloned'));
            return;
        }
        this.ux.startSpinner(messages.getMessage('cloningAssets'));
        try {
            await downloadGit(reactforceFolder, flags);
            this.ux.stopSpinner("done");
            this.ux.log(messages.getMessage('assetsCloned'));
            return destination;
        } catch (error) {
            this.ux.log(messages.getMessage('cloningFailed'));
            this.ux.log(messages.getMessage('restrictedRespository'));
            process.exit();
        }
    }
    private async copyStaticResources(flags: object, roothPath: string, templatesPath: string): Promise<void> {
        this.ux.startSpinner(messages.getMessage('copyingStaticResources'));
        const reactforceStaticResource = path.join(templatesPath, "/templates/default/sf/staticresources/ReactforceAssets");
        const reactforceStaticResourceXml = path.join(templatesPath, "/templates/default/sf/staticresources/ReactforceAssets.resource-meta.xml");
        const staticResourcesPath = path.join(roothPath, flags['static-resources']+"/ReactforceAssets");
        const staticResourcesPathXml = path.join(roothPath, flags['static-resources']+"/ReactforceAssets.resource-meta.xml");
        if(!fs.existsSync(staticResourcesPath)){
            fs.copySync(reactforceStaticResource, staticResourcesPath, {
                dereference: true,
            });
        }
        if(!fs.existsSync(staticResourcesPathXml)){
            fs.copyFileSync(reactforceStaticResourceXml, staticResourcesPathXml);
        }
        this.ux.stopSpinner("done");
        this.ux.log(messages.getMessage('staticResourcesCopied'));
    }
    public async run(): Promise<AnyJson> {
        const {flags} = await this.parse(ReactforceInit);
        const roothPath =  await getRootPath();
        const reactforceFolder = path.join(roothPath, "/reactforce");
        const reactforceConfig = path.join(roothPath, "/reactforce/config.json");
        // this.ux.log(JSON.stringify(flags, null, 2));

        this.ux.log("Reactforce path = "+reactforceFolder);
        
        if (!fs.existsSync(reactforceFolder)){
            fs.mkdirSync(reactforceFolder);
        }
        if (!fs.existsSync(reactforceConfig)){
            const configJson = {
                "assetsRepository": flags.repository
            };
            fs.writeFileSync(reactforceConfig, JSON.stringify(configJson, null, 2));
        }
        
        //Clone github template
        const templatesPath = await this.cloneTemplate(reactforceFolder, flags);

        //Copy template static resource into salesforce package
        await this.copyStaticResources(flags, roothPath, templatesPath);
        this.ux.log(messages.getMessage('initCommandSuccess'));
        return {  };
    }
}
