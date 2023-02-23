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
const packageJson = require("../../../package.json");
// Initialize Messages with the current plugin directory
core_1.Messages.importMessagesDirectory(__dirname);
// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core_1.Messages.loadMessages('sfdx-react-plugin', 'org');
class Index extends command_1.SfdxCommand {
    async run() {
        this.ux.log('Sfdx react plugin folder' + packageJson.version);
        // Return an object to be displayed with --json
        return {};
    }
}
exports.default = Index;
Index.description = messages.getMessage('commandDescription');
Index.examples = messages.getMessage('examples').split(os.EOL);
//# sourceMappingURL=index.js.map