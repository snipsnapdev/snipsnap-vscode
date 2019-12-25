const https = require('https');
const vscode = require('vscode');
const { getWorkspaceFile } = require('./helpers/utils');

/* local utility functions */

// check if any folder is open
// workspaceExits(void) -> void
const workspaceExists = () =>
  new Promise((res, rej) => (vscode.workspace.name ? res() : rej()));

// check if package.json exists in the workspace
const packageExists = () => getWorkspaceFile('package.json');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // check if our extension has already been activated
  vscode.commands.getCommands().then((commands) =>
    new Promise((res, rej) =>
      commands.find((command) => command.includes('snipsnap_activate'))
        ? rej()
        : res()
    )
      .then((res) => {
        // start command registering
        const disposable = vscode.commands.registerCommand(
          'extension.snipsnap_activate',
          () => {
            // check workspace existence, otherwise do not
            workspaceExists()
              .then((res) => packageExists())
              // reading package.json content
              .then((res) => vscode.workspace.fs.readFile(res[0]))
              .then((res) => {
                // getting the content of package.json
                const { dependencies = {}, devDependencies = {} } = JSON.parse(
                  Buffer.from(res).toString()
                );
                // creating list of all project libraries
                const librariesInUse = Array.from(
                  new Set([
                    ...Object.keys(dependencies),
                    ...Object.keys(devDependencies),
                  ])
                );

                /*
                 * get ready for an API call
                 */

                const reqPayload = {
                  // TODO: think of a way of handling lang other than js
                  language: 'javascript',
                  ide: 'vscode',
                  packages: librariesInUse,
                };

                // preparing options object
                const reqOps = {
                  headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(
                      JSON.stringify(reqPayload)
                    ),
                  },
                };

                // making an API call wrapped in a promise
                return new Promise((resolve, reject) => {
                  const req = https
                    .request(
                      'https://api.snipsnap.dev/snippets',
                      reqOps,
                      (res) => {
                        let body = '';
                        res.on('data', (d) => {
                          body += d;
                        });
                        res.on('end', () => {
                          resolve(body);
                        });
                      }
                    )
                    .on('error', (e) => reject(e));
                  req.write(JSON.stringify(reqPayload));
                  req.end();
                });
              })
              .then((res) => {
                // constructing absolute path for our future file
                const wPath = vscode.Uri.file(
                  `${vscode.workspace.workspaceFolders[0].uri.fsPath}/.vscode/snipsnap.code-snippets`
                );
                // writing fetched snippets data to the code-snippets file
                vscode.workspace.fs.writeFile(wPath, Buffer.from(res, 'utf8'));
                vscode.window.showInformationMessage(
                  `[Snipsnap] You are using the latest snippets available for ${vscode.workspace.name} project.`
                );
              })
              .catch((err) => console.error(err, 'Something is wrong'));
          }
        );

        context.subscriptions.push(disposable);
        // activating the snap() right away
        vscode.commands.executeCommand('extension.snipsnap_activate');
      })
      .catch((err) => {
        vscode.commands.executeCommand('extension.snipsnap_activate');
      })
  );
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
  vscode.window.showInformationMessage(
    '[Snipsnap] The extension is turned off.'
  );
}

module.exports = {
  activate,
  deactivate,
};
