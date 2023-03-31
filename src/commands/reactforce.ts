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
const packageJson = require("../../package.json");

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('@cloudpremise/reactforce', 'reactforce');

export default class Reactforce extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  static flagsConfig = {
    // can pass either --version or -v
    version: flags.boolean({
        char: 'v',
        description: messages.getMessage('versionFlagDescription'),
    }),
  }

  public async run(): Promise<AnyJson> {
    if(this.flags.version){
        this.ux.log(messages.getMessage("versionDescription")+" "+packageJson.version);
    }else{
        this.ux.log(messages.getMessage("welcomeDescription"));
    }
    return {  };
  }
}