// vscode api
const vscode = require('vscode');

// utilities
const isWorkspace = () =>
  console.debug(vscode.workspace.name) || !!vscode.workspace.name;

const packageExists = () =>
  console.debug('Package.json is available!') ||
  vscode.workspace.findFiles('package.json', 1);

const snapOnWorkspaceChange = () => {
  console.debug('Postponing the snapping...');
  vscode.workspace.onDidChangeWorkspaceFolders(() => {
    console.debug('Workspace folders did change!');
    vscode.commands.executeCommand('extension.snap');
    vscode.window.showInformationMessage('Rerunning Snap...');
  });
  console.debug('Postponed!');
  return;
};

// some test data to receive after our fake req
const testData = {
  'Print pringles': {
    scope: 'javascript, typescript',
    prefix: 'logp',
    body: ["console.log('$1 pringles');", '$2'],
    description: 'Log pringles output to console'
  }
};

// our fakeReq itself
const fakeReq = req => {
  console.log('Receved request data: ', req);
  console.log('Simulating fetching data from remote host....');
  return new Promise((res, rej) =>
    setTimeout(
      () =>
        req
          ? res(JSON.stringify(testData))
          : rej(new Error('You must provide request data')),
      500
    )
  );
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  vscode.window.showInformationMessage('Snipsnap is armed and ready');
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'extension.snap',
    function snap() {
      console.debug('All conditional for the snap fn have been met');
      /* This code will be executed every time the command is executed */
      // Determing if any workspace is currenly open
      console.debug('Running snap...');
      if (isWorkspace) {
        console.debug('Directory is a workspace');
        console.debug('Checking if package.json available...');
        packageExists()
          .then(
            res =>
              console.debug('Reading package.json...') ||
              vscode.workspace.fs.readFile(res[0])
          )
          .then(res => {
            // getting the content of package.json
            const { dependencies = {}, devDependencies = {} } = JSON.parse(
              Buffer.from(res).toString()
            );
            // creating list of all project libraries
            const librariesInUse = Array.from(
              new Set([
                ...Object.keys(dependencies),
                Object.keys(devDependencies)
              ])
            );
            console.debug(
              'Package.json contains following deps:',
              librariesInUse
            );
            console.debug('Preparing the request...');
            return fakeReq(librariesInUse);
          })
          .then(res => {
            console.debug('Successfully fetched the data:', res);
            // constructing absolute path for our future file
            const wPath = vscode.Uri.file(
              vscode.workspace.workspaceFolders[0].uri.fsPath +
                '/.vscode/snipsnap.code-snippets'
            );
            console.debug('Saving fetched snippets into a file...');
            // writing fetched snippets data to the code-snippets file
            vscode.workspace.fs.writeFile(wPath, Buffer.from(res, 'utf8'));
            console.debug('File has been created or overwritten!');
            vscode.window.showInformationMessage(
              '[Snipsnap] You are using the latest snippets available out there.'
            );
          })
          .catch(err => console.error(err, 'Something is wrong'))
          .finally(() => snapOnWorkspaceChange()); //activating background tracking of workspace changes
      } else {
        snapOnWorkspaceChange();
      }
    }
  );

  context.subscriptions.push(disposable);
  //activating the snap() right away
  vscode.commands.executeCommand('extension.snap');
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
  deactivate
};
