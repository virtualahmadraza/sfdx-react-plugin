reactforce
==========

A framework for developing and deploying ReactJS applications on Salesforce.com

[![Version](https://img.shields.io/npm/v/reactforce.svg)](https://npmjs.org/package/reactforce)
[![CircleCI](https://circleci.com/gh/cloudpremise/reactforce/tree/master.svg?style=shield)](https://circleci.com/gh/cloudpremise/reactforce/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/cloudpremise/reactforce?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/reactforce/branch/master)
[![Greenkeeper](https://badges.greenkeeper.io/cloudpremise/reactforce.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/cloudpremise/reactforce/badge.svg)](https://snyk.io/test/github/cloudpremise/reactforce)
[![Downloads/week](https://img.shields.io/npm/dw/reactforce.svg)](https://npmjs.org/package/reactforce)
[![License](https://img.shields.io/npm/l/reactforce.svg)](https://github.com/cloudpremise/reactforce/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g @cloudpremise/reactforce
$ sfdx COMMAND
running command...
$ sfdx (--version)
@cloudpremise/reactforce/0.0.1 darwin-x64 node-v16.15.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx reactforce:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-reactforceorg--n-string--f--v-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx reactforce:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

print a greeting and your org IDs

```
USAGE
  $ sfdx reactforce:org [-n <string>] [-f] [-v <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -f, --force                                                                       example boolean flag
  -n, --name=<value>                                                                name to print
  -u, --targetusername=<value>                                                      username or alias for the target
                                                                                    org; overrides default target org
  -v, --targetdevhubusername=<value>                                                username or alias for the dev hub
                                                                                    org; overrides default dev hub org
  --apiversion=<value>                                                              override the api version used for
                                                                                    api requests made by this command
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  print a greeting and your org IDs

EXAMPLES
  $ sfdx reactforce:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com

  $ sfdx reactforce:org --name myname --targetusername myOrg@example.com
```

_See code: [src/commands/reactforce/org.ts](https://github.com/cloudpremise/reactforce/blob/v0.0.1/src/commands/reactforce/org.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `reactforce:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx reactforce:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run reactforce:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!

#################################################################################################################
# Common Commands
## Test the plugin locally
sfdx plugins link .

## Remove the linked plugin
sfdx plugins unlink .

## See what plugins are installed
sfdx plugins

## Install the latest plugin from npm 
sfdx plugins install @cloudpremise/reactforce@latest

## Install an older version of the plugin from npm 
sfdx plugins install @cloudpremise/reactforce@0.0.4