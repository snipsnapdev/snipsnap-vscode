const https = require('https')
const https = require('https')
const vscode = require('vscode')

// utilities

const isWorkspace = () => !!vscode.workspace.name

const packageExists = () => vscode.workspace.findFiles('package.json', 1)

const snapOnWorkspaceChange = () => {
  vscode.workspace.onDidChangeWorkspaceFolders(() => {
    vscode.commands.executeCommand('extension.snap')
    vscode.window.showInformationMessage('Rerunning Snap...')
  })
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  vscode.window.showInformationMessage('Snipsnap is armed and ready')
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('extension.snap', () => {
    /* This code will be executed every time the command is executed */
    // Determing if any workspace is currenly open
    if (isWorkspace) {
      packageExists()
        .then((res) => vscode.workspace.fs.readFile(res[0]))
        .then((res) => {
          // getting the content of package.json
          const { dependencies = {}, devDependencies = {} } = JSON.parse(
            Buffer.from(res).toString()
          )
          // creating list of all project libraries
          const librariesInUse = Array.from(
            new Set([
              ...Object.keys(dependencies),
              ...Object.keys(devDependencies),
            ])
          )
          // get ready for an API call
          const reqPayload = {
            // TODO: how to handle language field with other languages?
            language: 'javascript',
            ide: 'vscode',
            packages: librariesInUse,
          }

          const reqOps = {
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(JSON.stringify(reqPayload)),
            },
          }

          // making an API call
          return new Promise((resolve, reject) => {
            const req = https
              .request('https://api.snipsnap.dev/snippets', reqOps, (res) => {
                let body = ''
                res.on('data', (d) => {
                  body += d
                })
                res.on('end', () => {
                  resolve(body)
                })
              })
              .on('error', (e) => reject(e))
            req.write(JSON.stringify(reqPayload))
            req.end()
          })
        })
        .then((res) => {
          // constructing absolute path for our future file
          const wPath = vscode.Uri.file(
            `${vscode.workspace.workspaceFolders[0].uri.fsPath}/.vscode/snipsnap.code-snippets`
          )
          // writing fetched snippets data to the code-snippets file
          vscode.workspace.fs.writeFile(wPath, Buffer.from(res, 'utf8'))
          vscode.window.showInformationMessage(
            '[Snipsnap] You are using the latest snippets available out there.'
          )
        })
        .catch((err) => console.error(err, 'Something is wrong'))
        .finally(() => snapOnWorkspaceChange()) // activating background tracking of workspace changes
    } else {
      snapOnWorkspaceChange()
    }
  })

  context.subscriptions.push(disposable)
  // activating the snap() right away
  vscode.commands.executeCommand('extension.snap')
}
exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() {
  vscode.window.showInformationMessage(
    '[Snipsnap] The extension is turned off.'
  )
}

module.exports = {
  activate,
  deactivate,
}
