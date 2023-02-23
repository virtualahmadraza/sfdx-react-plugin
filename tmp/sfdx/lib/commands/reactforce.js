"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const os = require("os");
const command_1 = require("@salesforce/command");
const core_1 = require("@salesforce/core");
const packageJson = require("../../package.json");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core_1.Messages.loadMessages('sfdx-react-plugin', 'reactforce');
class Reactforce extends command_1.SfdxCommand {
    async run() {
        if (this.flags.version) {
            this.ux.log(messages.getMessage("versionDescription") + " " + packageJson.version);
        }
        else {
            this.ux.log(messages.getMessage("welcomeDescription"));
        }
        return {};
    }
}
exports.default = Reactforce;
Reactforce.description = messages.getMessage('commandDescription');
Reactforce.examples = messages.getMessage('examples').split(os.EOL);
Reactforce.flagsConfig = {
    // can pass either --version or -v
    version: command_1.flags.boolean({
        char: 'v',
        description: messages.getMessage('versionFlagDescription'),
    }),
};
//# sourceMappingURL=reactforce.js.map