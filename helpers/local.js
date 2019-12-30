const https = require('https');
/* eslint-disable-next-line import/no-unresolved */
const { Uri, window, workspace } = require('vscode');
const { ifElse } = require('./common');

// makes any message appear with brand sign
// brandMessage(msg: String, type?: String) -> String
const brandMessage = (msg, type = 0) => {
  switch (type) {
    case 2:
      window.showErrorMessage(`[Snipsnap] ${msg}`);
      break;
    case 1:
      window.showWarningMessage(`[Snipsnap] ${msg}`);
      break;
    default:
      window.showInformationMessage(`[Snipsnap] ${msg}`);
  }
};

// resolves if passed command argument already exists in vscode.commands
// commandExists(commandsObj: vscode.commands) -> (command: String) -> Promise
const commandExists = (commandsObj) => (command) => commandsObj
  .getCommands()
  .then(
    ($commands) => new Promise((res, rej) => ($commands.find((cmd) => cmd.includes(command)) ? rej() : res()))
  );

// function that specifies error/warnings handling behaviour
const handleErrors = (err) => console.debug(err) || brandMessage('Something went wrong', 2);

// auto activation only if some workspace is open and
// package.json exists
// checkInitialActivationConditions($workspace: vscode.workspace) -> Promise
const checkInitialActivationConditions = ($workspace) => new Promise((resolve, reject) => ifElse(
  $workspace.name, // workspace is open
  () => $workspace.findFiles('package.json', 1).then(resolve, reject),
  () => reject(Error('No workspace is open'))
)());

// takes a filename and returns Promise obj with Uri
// (fileName: String) -> Thenable<Uri>
const getWorkspaceFile = (fileName = '') => workspace.findFiles(fileName, 1);

// takes an Uri and parses content of a file
// getFileContent($workspace: vscode.workspace, uri: Object) -> JSON
const getFileContent = ($workspace, packageUri) => $workspace.fs
  .readFile(packageUri)
  .then(Buffer.from)
  .then(JSON.parse);

// fetches snippets from remote server
// fetchSnippets(reqOptions: Object, reqPayload: JSON) -> Promise
const fetchSnippets = (reqOptions, reqPayload) => new Promise((resolve, reject) => {
  const req = https
    .request('https://api.snipsnap.dev/snippets', reqOptions, (response) => {
      let body = '';
      response.on('data', (d) => {
        body += d;
      });
      response.on('end', () => {
        resolve(body);
      });
    })
    .on('error', (e) => reject(e));
  req.write(reqPayload);
  req.end();
});

// injects snippets file with data into current workspace's .vscode/
const injectSnippetFile = ($workspace) => (snippetsData) => {
  // constructing absolute path for our future file
  const wPath = Uri.file(
    `${$workspace.workspaceFolders[0].uri.fsPath}/.vscode/snipsnap.code-snippets`
  );
  // writing fetched snippets data to the code-snippets file
  $workspace.fs.writeFile(wPath, Buffer.from(snippetsData, 'utf8'));
  window.showInformationMessage(
    brandMessage(
      `Snippets successfully fetched! You are using the latest snippets available for ${$workspace.name} project.`
    )
  );
};

// errorThrower
const thenableOnReject = (err) => handleErrors(err);

module.exports = {
  getWorkspaceFile,
  fetchSnippets,
  handleErrors,
  checkInitialActivationConditions,
  getFileContent,
  injectSnippetFile,
  brandMessage,
  thenableOnReject,
};
