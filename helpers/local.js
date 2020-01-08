const https = require('https');
/* eslint-disable-next-line import/no-unresolved */
const { Uri, window, workspace } = require('vscode');
const lockfile = require('@yarnpkg/lockfile');
const { ifElse, curry } = require('./common');

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
const commandExists = (commandsObj) => (command) =>
  commandsObj
    .getCommands()
    .then(
      ($commands) =>
        new Promise((res, rej) =>
          $commands.find((cmd) => cmd.includes(command)) ? rej() : res()
        )
    );

// function that specifies error/warnings handling behaviour
const handleErrors = (err) => {
  throw err;
};
// || brandMessage('Something went wrong', 2);

// auto activation only if some workspace is open and
// package.json exists
// checkInitialActivationConditions($workspace: vscode.workspace) -> Promise
const checkInitialActivationConditions = ($workspace) =>
  new Promise((resolve, reject) =>
    ifElse(
      $workspace.name, // workspace is open
      () => $workspace.findFiles('package.json', 1).then(resolve, reject),
      () => reject(Error('No workspace is open'))
    )()
  );

// takes a filename and returns Promise obj with Uri
// (fileName: String) -> Thenable<Uri>
const getWorkspaceFile = (fileName = '') => workspace.findFiles(fileName, 1);

// takes an Uri and parses content of a file
// getFileContent($workspace: vscode.workspace, uri: Object) -> JSON
const getFileContent = curry(
  ($workspace, packageUri) =>
    console.log(packageUri) ||
    $workspace.fs
      .readFile(packageUri)
      .then(Buffer.from)
      .then(JSON.parse)
);

const getLockFileContent = curry(($workspace, lockFileUri) =>
  $workspace.fs
    .readFile(lockFileUri)
    .then((res) => Buffer.from(res, 'utf8').toString())
    .then(lockfile.parse)
);

// fetches snippets from remote server
// fetchSnippets(reqOptions: Object, reqPayload: JSON) -> Promise
const fetchSnippets = (reqOptions, reqPayload) =>
  new Promise((resolve, reject) => {
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
  console.log(snippetsData);
  const wPath = Uri.file(
    `${$workspace.workspaceFolders[0].uri.fsPath}/.vscode/snipsnap.code-snippets`
  );
  if (snippetsData.length > 2) {
    // check if there is only {} in response string
    // writing fetched snippets data to the code-snippets file
    $workspace.fs.writeFile(wPath, Buffer.from(snippetsData, 'utf8'));
    window.showInformationMessage(
      brandMessage(
        `Snippets successfully fetched! You are using the latest snippets available for ${$workspace.name} project.`
      )
    );
  } else {
    brandMessage(
      `No available snippets for libraries in ${workspace.name} project. Visit https://snipsnap.dev for more information.`
    );
  }
};

// errorThrower for thenable objects
const thenableOnReject = handleErrors;

// scans for yarn.lock and package-lock.json files and returns its deps
const getSubDependencies = ($workspace) => (currentDepsArray) =>
  $workspace
    .findFiles('yarn.lock', 1)
    .then((res) => (res.length ? getLockFileContent($workspace, res[0]) : '{}'))
    .then((yarnRes) =>
      $workspace
        .findFiles('package-lock.json', 1)
        .then((res) => (res.length ? getFileContent($workspace, res[0]) : '{}'))
        .then((pckgRes) => {
          const yarnDeps = Object.keys(yarnRes.object || {})
            .map((key) => key.replace(/@.*$/, ''))
            .filter((a) => !!a);
          const pckgDeps = Object.keys(pckgRes.dependencies || {})
            .map((key) => key.replace(/@.*$/, ''))
            .filter((a) => !!a);
          return Array.from(
            new Set([...currentDepsArray, ...yarnDeps, ...pckgDeps])
          );
        })
    );

module.exports = {
  getWorkspaceFile,
  fetchSnippets,
  handleErrors,
  checkInitialActivationConditions,
  getFileContent,
  injectSnippetFile,
  brandMessage,
  thenableOnReject,
  getSubDependencies,
  getLockFileContent,
};
