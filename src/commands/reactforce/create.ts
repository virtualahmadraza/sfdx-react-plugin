/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { SfdxCommand, flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { getRootPath, download } from "../../utils/helper";
const util = require('util');
const path = require('path');
const fs = require('fs-extra');
const rm = require('rimraf').sync;
const exec = util.promisify(require('child_process').exec);
const downloadGit = util.promisify(download);


// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-react-plugin', 'create');

export default class ReactforceCreate extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  static flagsConfig = {
    // can pass either --version or -v
    'app-name': flags.string({
        char: 'a',
        description: messages.getMessage('appNameFlagDesc'),
        required: true
    }),
    'template-name': flags.string({
        char: 't',
        description: messages.getMessage('templateNameFlagDesc'),
        default: 'default'
    }),
    'repository': flags.string({
        char: 'r',
        description: messages.getMessage('repositoryFlagDesc'),
        default: 'cloudpremise/reactforce-templates'
    }),
    'branch': flags.string({
        char: 'b',
        description: messages.getMessage('templateBranchFlagDesc'),
        default: 'main'
    }),
    'cra-template': flags.string({
        char: 'c',
        description: messages.getMessage('craTemplateFlagDesc'),
        default: 'cra-template'
    }),
    'vanilla': flags.boolean({
        char: 'v',
        description: messages.getMessage('vanillaFlagDesc'),
        default: false
    }),
  }

  private async installReactApp(flags: object, reactforcePath: string, appName: string): Promise<void>{
    this.ux.startSpinner(messages.getMessage('installingReactApp'));
    try {
        process.chdir(reactforcePath);
        const craTemplate = flags['cra-template'];
        let reactAppCommand = 'npx create-react-app '+appName.toLowerCase()+' --template '+craTemplate+' -y';
        await exec(reactAppCommand);
        this.ux.stopSpinner("done");
        this.ux.log(messages.getMessage('reactAppInstalled'));
    } catch (error) {
        this.ux.log(messages.getMessage('errorInstallingReactApp')+" "+error.message);
        process.exit();
    }
  }

  private async modifyReactPackageJson(reactAppPath: string): Promise<void>{
    try{
        const packageJson = path.join(reactAppPath, "package.json");
        if (!fs.existsSync(packageJson)){
            this.ux.log(messages.getMessage('reactAppNotInstalled'));
            return;
        }

        const packageJsonContents = fs.readFileSync(packageJson, "utf8");
        let json = JSON.parse(packageJsonContents);
        json['scripts'] = {
            "start": "SET HTTPS=true && react-app-rewired start",
            "start-mac": "HTTPS=true PORT=443 react-app-rewired start",
            "build": "react-app-rewired build",
            "test": "react-app-rewired test --env=jsdom",
            "eject": "react-scripts eject",
            "pushToManagedPackage": "npm run build && node scripts/managedPackage.js"
        };
        if(!json.hasOwnProperty("devDependencies")){
            json['devDependencies'] = {};
        }
        json['devDependencies'] = {
            ...json.devDependencies,
            "react-app-rewired": "^2.2.1"
        }
        
        const newJsonContent = JSON.stringify(json, null, 2);
        fs.writeFileSync(packageJson, newJsonContent);
    } catch(error) {

    }
  }

  private async installDependencies(reactAppPath: string): Promise<void> {
    this.ux.startSpinner(messages.getMessage('installingDependencies'));
    try {
        process.chdir(reactAppPath);
        await exec('npm install');
        this.ux.stopSpinner("done");
        this.ux.log(messages.getMessage('dependenciesInstalled'));
    } catch (error) {
        this.ux.log(messages.getMessage('dependenciesInstallationFailed'));
        process.exit();
    }
  }

  private async cloneTemplate(flags: object, reactforceFolder: string): Promise<string> {
        const repository = flags['repository'];
        const repositoryArray = repository.split("/");
        let repositoryName = repository;
        if(repositoryArray.length > 1){
            repositoryName = repositoryArray[1];
        }
        const destination = path.join(reactforceFolder, repositoryName);
        if (fs.existsSync(destination)){
            this.ux.log(messages.getMessage('templatesAlreadyCloned'));
            return destination;
        }
        this.ux.startSpinner(messages.getMessage('cloningTemplates'));
        try {
            await downloadGit(reactforceFolder, flags);
            this.ux.stopSpinner("done");
            this.ux.log(messages.getMessage('templatesCloned'));
            return destination;
        } catch (error) {
            this.ux.log(messages.getMessage('cloningFailed'));
            this.ux.log(messages.getMessage('restrictedRespository'));
            this.ux.log(error);
            process.exit();
        }
  }

  private async modifySalesforcePackage(flags: object, roothPath: string, templatesPath: string): Promise<void> {
    const appName = flags['app-name'];
    const template = flags['template-name'];
    const salesforcePath = "/force-app/main/default";
    const controllerName = appName+"Ctrl";
    const visualForcePageName = appName+"Vf";
    const staticResourceName = appName;
    const templatePath = path.join(templatesPath, "/templates/"+template+"/sf");
    const classesPath = path.join(roothPath, salesforcePath+"/classes");
    

    //Copy controller for visual force page
    this.modifyVisualForceController(templatePath, roothPath, classesPath, salesforcePath, controllerName);
    
    //Copy controller for lightning component
    this.modifyLightningController(appName, templatePath, roothPath, salesforcePath);
    
    //Copy visual force page
    this.modifyVisualForcePage(templatePath, roothPath, salesforcePath, visualForcePageName, controllerName, staticResourceName);

    //Create lightning component
    this.createLightningComponent(appName, roothPath, templatePath, salesforcePath);
    
    //Create static resource for react app
    this.createReactAppStaticResource(templatePath, roothPath, salesforcePath, staticResourceName);

    //Create flexipage for react app
    this.createFlexipage(appName, roothPath, templatePath, salesforcePath);
    
    this.ux.log(messages.getMessage('salesforceFilesCopied'));
  }
  private async modifyVisualForceController(templatePath, roothPath, classesPath, salesforcePath, controllerName): Promise<void> {
    const controllerSrcPath = path.join(templatePath, "/classes/rfPrototypeCtrl.cls");
    const controllerSrcPathXml = path.join(templatePath, "/classes/rfPrototypeCtrl.cls-meta.xml");
    const controllerDestPath = path.join(roothPath, salesforcePath+"/classes/"+controllerName+".cls");
    const controllerDestPathXml = path.join(roothPath, salesforcePath+"/classes/"+controllerName+".cls-meta.xml");
    if (!fs.existsSync(classesPath)){
        fs.mkdirSync(classesPath);
    }
    if(!fs.existsSync(controllerDestPath)){
        let controllerContents = fs.readFileSync(controllerSrcPath, "utf8");
        controllerContents = controllerContents.replace(/rfPrototypeCtrl/g, () => {return controllerName;});
        fs.writeFileSync(controllerDestPath, controllerContents);
    }
    if(!fs.existsSync(controllerDestPathXml)){
        fs.copyFileSync(controllerSrcPathXml, controllerDestPathXml);
    }
  }
  private async modifyLightningController(appName, templatePath, roothPath, salesforcePath): Promise<void> {
    const ltgControllerName = appName+"LtgCtrl";
    const ltgControllerSrcPath = path.join(templatePath, "/classes/rfPrototypeLtgCtrl.cls");
    const ltgControllerSrcPathXml = path.join(templatePath, "/classes/rfPrototypeLtgCtrl.cls-meta.xml");
    const ltgControllerDestPath = path.join(roothPath, salesforcePath+"/classes/"+ltgControllerName+".cls");
    const ltgControllerDestPathXml = path.join(roothPath, salesforcePath+"/classes/"+ltgControllerName+".cls-meta.xml");
    if(!fs.existsSync(ltgControllerDestPath)){
        let controllerContents = fs.readFileSync(ltgControllerSrcPath, "utf8");
        controllerContents = controllerContents.replace(/rfPrototypeLtgCtrl/g, () => {return ltgControllerName;});
        fs.writeFileSync(ltgControllerDestPath, controllerContents);
    }
    if(!fs.existsSync(ltgControllerDestPathXml)){
        fs.copyFileSync(ltgControllerSrcPathXml, ltgControllerDestPathXml);
    }
  }
  private async modifyVisualForcePage(templatePath, roothPath, salesforcePath, visualForcePageName, controllerName, staticResourceName) : Promise<void> {
    const pagesPath = path.join(roothPath, salesforcePath+"/pages");
    const vfPageSrcPath = path.join(templatePath, "/pages/rfPrototypeVf.page");
    const vfPageSrcPathXml = path.join(templatePath, "/pages/rfPrototypeVf.page-meta.xml");
    const vfPageDestPath = path.join(roothPath, salesforcePath+"/pages/"+visualForcePageName+".page");
    const vfPageDestPathXml = path.join(roothPath, salesforcePath+"/pages/"+visualForcePageName+".page-meta.xml");
    if (!fs.existsSync(pagesPath)){
        fs.mkdirSync(pagesPath);
    }
    if(!fs.existsSync(vfPageDestPath)){
        let sfPageContents = fs.readFileSync(vfPageSrcPath, "utf8");
        sfPageContents = sfPageContents.replace(/rfPrototypeCtrl/g, () => {return controllerName;});
        sfPageContents = sfPageContents.replace(/CustomerPortal/g, () => {return staticResourceName;});
        fs.writeFileSync(vfPageDestPath, sfPageContents);
    }
    if(!fs.existsSync(vfPageDestPathXml)){
        fs.copyFileSync(vfPageSrcPathXml, vfPageDestPathXml);
    }
  }
  private async createLightningComponent(appName, roothPath, templatePath, salesforcePath): Promise<void> {
    const auraPath = path.join(roothPath, salesforcePath+"/aura");
    const ltgComponentName = appName+"Ltg";
    const ltgSrcComponentPath = path.join(templatePath, "/aura/rfPrototypeLtg");    
    const ltgDestComponentPath = path.join(auraPath, ltgComponentName);
    if (!fs.existsSync(auraPath)){
        fs.mkdirSync(auraPath);
    }
    if (!fs.existsSync(ltgDestComponentPath)){
        fs.mkdirSync(ltgDestComponentPath);
    }

    const auraDocSrcPath = path.join(ltgSrcComponentPath, "rfPrototypeLtg.auradoc");
    const auraDocDestPath = path.join(ltgDestComponentPath, ltgComponentName+".auradoc");
    if(!fs.existsSync(auraDocDestPath)){
        let auraDocContents = fs.readFileSync(auraDocSrcPath, "utf8");
        auraDocContents = auraDocContents.replace(/rfPrototypeLtg/g, () => {return ltgComponentName;});
        fs.writeFileSync(auraDocDestPath, auraDocContents);
    }

    const componentSrcPath = path.join(ltgSrcComponentPath, "rfPrototypeLtg.cmp");
    const componentDestPath = path.join(ltgDestComponentPath, ltgComponentName+".cmp");
    if(!fs.existsSync(componentDestPath)){
        let componentContents = fs.readFileSync(componentSrcPath, "utf8");
        componentContents = componentContents.replace(/rfPrototypeLtg/g, () => {return ltgComponentName;});
        fs.writeFileSync(componentDestPath, componentContents);
    }

    const componentXmlSrcPath = path.join(ltgSrcComponentPath, "rfPrototypeLtg.cmp-meta.xml");
    const componentXmlDestPath = path.join(ltgDestComponentPath, ltgComponentName+".cmp-meta.xml");
    if(!fs.existsSync(componentXmlDestPath)){
        let xmlContents = fs.readFileSync(componentXmlSrcPath, "utf8");
        xmlContents = xmlContents.replace(/rfPrototypeLtg/g, () => {return ltgComponentName;});
        fs.writeFileSync(componentXmlDestPath, xmlContents);
    }

    const cssSrcPath = path.join(ltgSrcComponentPath, "rfPrototypeLtg.css");
    const cssDestPath = path.join(ltgDestComponentPath, ltgComponentName+".css");
    if(!fs.existsSync(cssDestPath)){
        let cssContents = fs.readFileSync(cssSrcPath, "utf8");
        cssContents = cssContents.replace(/rfPrototypeLtg/g, () => {return ltgComponentName;});
        fs.writeFileSync(cssDestPath, cssContents);
    }

    const designSrcPath = path.join(ltgSrcComponentPath, "rfPrototypeLtg.design");
    const designDestPath = path.join(ltgDestComponentPath, ltgComponentName+".design");
    if(!fs.existsSync(designDestPath)){
        let designContents = fs.readFileSync(designSrcPath, "utf8");
        designContents = designContents.replace(/rfPrototypeLtg/g, () => {return ltgComponentName;});
        fs.writeFileSync(designDestPath, designContents);
    }

    const svgSrcPath = path.join(ltgSrcComponentPath, "rfPrototypeLtg.svg");
    const svgDestPath = path.join(ltgDestComponentPath, ltgComponentName+".svg");
    if(!fs.existsSync(svgDestPath)){
        let svgContents = fs.readFileSync(svgSrcPath, "utf8");
        svgContents = svgContents.replace(/rfPrototypeLtg/g, () => {return ltgComponentName;});
        fs.writeFileSync(svgDestPath, svgContents);
    }

    const controllerSrcPath = path.join(ltgSrcComponentPath, "rfPrototypeLtgController.js");
    const controllerDestPath = path.join(ltgDestComponentPath, ltgComponentName+"Controller.js");
    if(!fs.existsSync(controllerDestPath)){
        let controllerContents = fs.readFileSync(controllerSrcPath, "utf8");
        controllerContents = controllerContents.replace(/Resource.rfPrototypeLtg/g, () => {return "Resource."+appName;});
        controllerContents = controllerContents.replace(/rfPrototypeLtgController/g, () => {return ltgComponentName+"Controller";});
        fs.writeFileSync(controllerDestPath, controllerContents);
    }

    const helperSrcPath = path.join(ltgSrcComponentPath, "rfPrototypeLtgHelper.js");
    const helperDestPath = path.join(ltgDestComponentPath, ltgComponentName+"Helper.js");
    if(!fs.existsSync(helperDestPath)){
        let helperContents = fs.readFileSync(helperSrcPath, "utf8");
        helperContents = helperContents.replace(/rfPrototypeLtgHelper/g, () => {return ltgComponentName+"Helper";});
        fs.writeFileSync(helperDestPath, helperContents);
    }

    const rendererSrcPath = path.join(ltgSrcComponentPath, "rfPrototypeLtgRenderer.js");
    const rendererDestPath = path.join(ltgDestComponentPath, ltgComponentName+"Renderer.js");
    if(!fs.existsSync(rendererDestPath)){
        let rendererContents = fs.readFileSync(rendererSrcPath, "utf8");
        rendererContents = rendererContents.replace(/rfPrototypeLtgRenderer/g, () => {return ltgComponentName+"Renderer";});
        fs.writeFileSync(rendererDestPath, rendererContents);
    }
  }
  private async createFlexipage(appName, roothPath, templatePath, salesforcePath): Promise<void> {
    const flexipagesPath = path.join(roothPath, salesforcePath+"/flexipages");
    const ltgComponentName = appName+"Ltg";
    const flexipageSrcComponentPath = path.join(templatePath, "/flexipages/rfPrototypeLtg.flexipage-meta.xml");    
    const flexipageDestComponentPath = path.join(flexipagesPath, ltgComponentName+".flexipage-meta.xml");
    if (!fs.existsSync(flexipagesPath)){
        fs.mkdirSync(flexipagesPath);
    }
    if(!fs.existsSync(flexipageDestComponentPath)){
        let flexipageContents = fs.readFileSync(flexipageSrcComponentPath, "utf8");
        flexipageContents = flexipageContents.replace(/rfPrototypeLtg/g, () => {return ltgComponentName;});
        fs.writeFileSync(flexipageDestComponentPath, flexipageContents);
    }
  }
  private async createReactAppStaticResource(templatePath, roothPath, salesforcePath, staticResourceName): Promise<void> {
    const staticResourcesPath = path.join(roothPath, salesforcePath+"/staticresources");
    const staticResourceCustomerPortalPath = path.join(roothPath, salesforcePath+"/staticresources/"+staticResourceName);
    const staticResourceSrcPath = path.join(templatePath, "/staticresources/CustomerPortal.resource-meta.xml");
    const staticResourceDestPath = path.join(roothPath, salesforcePath+"/staticresources/"+staticResourceName+".resource-meta.xml");
    if (!fs.existsSync(staticResourcesPath)){
        fs.mkdirSync(staticResourcesPath);
    }
    if (!fs.existsSync(staticResourceCustomerPortalPath)){
        fs.mkdirSync(staticResourceCustomerPortalPath);
    }
    if(!fs.existsSync(staticResourceDestPath)){
        let staticResourceXmlContents = fs.readFileSync(staticResourceSrcPath, "utf8");
        staticResourceXmlContents = staticResourceXmlContents.replace(/CustomerPortal/g, () => {return staticResourceName;});
        fs.writeFileSync(staticResourceDestPath, staticResourceXmlContents);
    }
  }

  private async modifyReactPackage(flags: object, templatesPath: string, reactAppPath: string): Promise<void> {
    const appName = flags['app-name'];
    const template = flags['template-name'];
    const templatePath = path.join(templatesPath, "/templates/"+template+"/react");
    const configPath = path.join(reactAppPath, "/config");
    const salesforceJsSrcPath = path.join(templatePath, "/config/salesforce.js");
    const salesforceJsDestPath = path.join(configPath, "/salesforce.js");
    if (!fs.existsSync(configPath)){
        fs.mkdirSync(configPath);
    }
    if(!fs.existsSync(salesforceJsDestPath)){
        fs.copyFileSync(salesforceJsSrcPath, salesforceJsDestPath);
    }
    
    const scriptsPath = path.join(reactAppPath, "/scripts");
    const managedPackageJsSrcPath = path.join(templatePath, "/scripts/managedPackage.js");
    const managedPackageJsDestPath = path.join(scriptsPath, "/managedPackage.js");
    if (!fs.existsSync(scriptsPath)){
        fs.mkdirSync(scriptsPath);
    }
    if(!fs.existsSync(managedPackageJsDestPath)){
        fs.copyFileSync(managedPackageJsSrcPath, managedPackageJsDestPath);
    }

    const envSrcPath = path.join(templatePath, "/.env");
    const envDestPath = path.join(reactAppPath, "/.env");
    const configOverridesSrcPath = path.join(templatePath, "/config-overrides.js");
    const configOverridesDestPath = path.join(reactAppPath, "/config-overrides.js");
    if(!fs.existsSync(envDestPath)){
        let envContents = fs.readFileSync(envSrcPath, "utf8");
        envContents = envContents.replace(/CustomerPortal/g, () => {return appName;});
        fs.writeFileSync(envDestPath, envContents);
    }
    if(!fs.existsSync(configOverridesDestPath)){
        fs.copyFileSync(configOverridesSrcPath, configOverridesDestPath);
    }

    const mainJsSrcPath = path.join(templatePath, "/public/app.main.js");
    const mainJsDestPath = path.join(reactAppPath, "/public/app.main.js");
    const assetsPath = path.join(reactAppPath, "/public/assets");
    const assetsJsPath = path.join(reactAppPath, "/public/assets/js");
    const assetsMainJsSrcPath = path.join(templatePath, "/public/assets/js/app.main.js");
    const assetsMainJsDestPath = path.join(reactAppPath, "/public/assets/js/app.main.js");
    if (!fs.existsSync(assetsPath)){
        fs.mkdirSync(assetsPath);
    }
    if (!fs.existsSync(assetsJsPath)){
        fs.mkdirSync(assetsJsPath);
    }
    if(!fs.existsSync(mainJsDestPath)){
        fs.copyFileSync(mainJsSrcPath, mainJsDestPath);
    }
    if(!fs.existsSync(assetsMainJsDestPath)){
        fs.copyFileSync(assetsMainJsSrcPath, assetsMainJsDestPath);
    }

    const appJsPath = path.join(reactAppPath, "/src/App.js");
    if(fs.existsSync(appJsPath)){
        let appJsContents = fs.readFileSync(appJsPath, "utf8");
        // appJsContents = appJsContents.replace("import logo from './logo.svg'", () => {return "";});
        appJsContents = appJsContents.replace(/<img src={logo}/g, () => {return "<img src={(window.hasOwnProperty('inlineApexAdaptor') ? window.inlineApexAdaptor.landingResources+'/': '')+logo}";});
        fs.writeFileSync(appJsPath, appJsContents);
    }

    this.ux.log(messages.getMessage('reactFilesCopied'));
  }

  private async createReactBuild(flags: object, reactAppPath: string): Promise<void> {
    this.ux.startSpinner(messages.getMessage('creatingReactAppBuild'));
    try {
        process.chdir(reactAppPath);
        let buildCommand = 'npm run build';
        if(flags['vanilla']){
            buildCommand = 'npm run pushToManagedPackage';
        }
        await exec(buildCommand);
        this.ux.stopSpinner("done");
        this.ux.log(messages.getMessage('reactAppBuildReady'));
    } catch (error) {
        this.ux.log(messages.getMessage('errorCreatingReactAppBuild'));
        process.exit();
    }
  }

  public async run(): Promise<AnyJson> {
    const {flags} = await this.parse(ReactforceCreate);
    const roothPath =  await getRootPath();
    const appName = flags['app-name'];
    
    const reactforceFolder = path.join(roothPath, "/reactforce");
    const tempFolder = path.join(reactforceFolder, "/.tmp");
    const reactAppPath = reactforceFolder+"/"+appName.toLowerCase();
    const reactAppPackageJsonPath = path.join(reactAppPath, "package.json");

    //Check if react app not already installed
    if (!fs.existsSync(reactAppPackageJsonPath)){
        //Install react app
        await this.installReactApp(flags, reactforceFolder, appName);

        if(flags.vanilla){
            //Modify package.json for customization
            await this.modifyReactPackageJson(reactAppPath);

            //Install modified react dependencies
            await this.installDependencies(reactAppPath);
        }
    }
    
    //Clone github template
    const templatesPath = await this.cloneTemplate(flags, tempFolder);

    //Modify salesforce package
    await this.modifySalesforcePackage(flags, roothPath, templatesPath);

    if(flags.vanilla){
        //Modify react app package
        await this.modifyReactPackage(flags, templatesPath, reactAppPath);
    }

    //Create react app build
    await this.createReactBuild(flags, reactAppPath);
    await rm(tempFolder, {});
    this.ux.log(messages.getMessage("createCommandSuccess"));
    return {  };
  }
}
