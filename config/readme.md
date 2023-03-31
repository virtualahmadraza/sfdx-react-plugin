https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_allowlist.htm

Create a file called unsignedPluginAllowList.json and put it in one of these directories:

(Linux and macOS): $HOME/.config/sfdx
(Windows) Depending on your Windows configuration, either C:\Users\username\.config\sfdx or %LOCALAPPDATA%\sfdx

an example file exists in this directory.  Create the file if it doesn't exist.  Otherwise add the plugin.

[
    "@cloudpremise/reactforce"
]