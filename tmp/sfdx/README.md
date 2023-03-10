sfdx-react-plugin
=================



[![Version](https://img.shields.io/npm/v/sfdx-react-plugin.svg)](https://npmjs.org/package/sfdx-react-plugin)
[![CircleCI](https://circleci.com/gh/virtualahmadraza/sfdx-react-plugin/tree/master.svg?style=shield)](https://circleci.com/gh/virtualahmadraza/sfdx-react-plugin/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/virtualahmadraza/sfdx-react-plugin?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-react-plugin/branch/master)
[![Greenkeeper](https://badges.greenkeeper.io/virtualahmadraza/sfdx-react-plugin.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/virtualahmadraza/sfdx-react-plugin/badge.svg)](https://snyk.io/test/github/virtualahmadraza/sfdx-react-plugin)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-react-plugin.svg)](https://npmjs.org/package/sfdx-react-plugin)
[![License](https://img.shields.io/npm/l/sfdx-react-plugin.svg)](https://github.com/virtualahmadraza/sfdx-react-plugin/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sfdx-react-plugin
$ sfdx COMMAND
running command...
$ sfdx (--version)
sfdx-react-plugin/0.0.8 win32-x64 node-v16.2.0
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx reactforce [-v] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-reactforce--v---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx reactforce [-v] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

print welcome message and reactforce version

```
USAGE
  $ sfdx reactforce [-v] [--json] [--loglevel
    trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

FLAGS
  -v, --version                                                                     version to print
  --json                                                                            format output as json
  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

DESCRIPTION
  print welcome message and reactforce version

EXAMPLES
  $ sfdx reactforce

  $ sfdx reactforce --version
```

_See code: [src/commands/reactforce.ts](https://github.com/virtualahmadraza/sfdx-react-plugin/blob/v0.0.8/src/commands/reactforce.ts)_
<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
