// vscode api
const vscode = require('vscode');

const testData = {
  'Print pringles': {
    scope: 'javascript, typescript',
    prefix: 'logp',
    body: ["console.log('$1 pringles');", '$2'],
    description: 'Log pringles output to console'
  }
};

const fakeReq = req =>
  new Promise((res, rej) =>
    setTimeout(() => res(JSON.stringify(testData)), 500)
  );

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Snapper is on');
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'extension.snap',
    function() {
      // The code you place here will be executed every time your command is executed
      vscode.workspace
        .findFiles('package.json', 1)
        .then(res => vscode.workspace.fs.readFile(res[0]))
        .then(res => {
          const { dependencies = {}, devDependencies } = JSON.parse(
            Buffer.from(res).toString()
          );
          const queryArr = [
            ...Object.keys(dependencies),
            ...Object.keys(devDependencies)
          ];
          fakeReq(queryArr)
            .then(res => {
              // constructing absolute path for out future file
              const wPath = vscode.Uri.file(
                vscode.workspace.workspaceFolders[0].uri.fsPath +
                  '/.vscode/snipsnap.code-snippets'
              );
              // writing our response to the code-snippets file
              vscode.workspace.fs.writeFile(wPath, Buffer.from(res, 'utf8'));
            })
            .catch(err => console.log(err));
        });
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
