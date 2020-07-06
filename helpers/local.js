const https = require('https');
/* eslint-disable-next-line import/no-unresolved */
const { Uri, window } = require('vscode');
const { curry, uniqify, compose } = require('./common');

// strips @ and slash part from submodule name, e.g.
// @angular/core -> angular, @storybook/react -> storybook
// transformSubModules(arr: Array<String>) -> Array<String>
const transformSubModules = (arr) => arr.map((key) => key.replace(/^@?(.+?)([/@:].+)/, '$1'));

const parseYarnLock = (content) =>
  content
    .replace(/(\n)/g, '#')
    .split('##')
    .slice(2)
    .map((entry) => entry.replace(/["#]/g, '').replace(/^(.+?):.*/, '$1'));

// makes any message appear with a brand sign
// type 1: warning message
// type 2: error message
// default: info message
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

// function that specifies error/warnings handling behaviour
const handleErrors = (err) => {
  brandMessage('Something went wrong, please, reload window', 2);
  console.debug(err);
};

// auto activation only if some workspace is open and
// package.json exists
// checkInitialActivationConditions($workspace: vscode.workspace) -> Promise
const checkInitialActivationConditions = ($workspace) =>
  new Promise((resolve, reject) =>
    $workspace.name // workspace is open
      ? $workspace.findFiles('package.json', 1).then(resolve, reject)
      : reject(Error('No workspace is open'))
  );

// takes a workspace and a filename and returns Promise obj with Uri
// ($workspace: vscode.workspace) -> (fileName: String) -> Thenable<Uri>
const getWorkspaceFile = curry(($workspace, fileName = '') => $workspace.findFiles(fileName, 1));

// takes a workspace and returns extension configuration as a plain object
// ($workspace: vscode.workspace) -> Object
const getExtensionConfig = ($workspace) => $workspace.getConfiguration('snipsnap');

// takes an Uri and parses content of a file
// getFileContent($workspace: vscode.workspace, uri: Object) -> JSON
const getFileContent = curry(($workspace, packageUri) =>
  $workspace.fs.readFile(packageUri).then(Buffer.from).then(JSON.parse)
);

const getYarnLockFileContent = curry(($workspace, lockFileUri) =>
  $workspace.fs
    .readFile(lockFileUri)
    .then((res) => Buffer.from(res, 'utf8').toString())
    .then(parseYarnLock)
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
  const wPath = Uri.file(`${$workspace.workspaceFolders[0].uri.fsPath}/.vscode/snipsnap.code-snippets`);
  // check if there is only '{}' in response string
  if (snippetsData.length > 2) {
    // writing fetched snippets data to the code-snippets file
    $workspace.fs.writeFile(wPath, Buffer.from(snippetsData, 'utf8'));
    if (getExtensionConfig($workspace).get('silent')) return;
    brandMessage(
      `Snippets successfully fetched! You are using the latest snippets available for ${$workspace.name} project.`
    );
  } else {
    brandMessage(
      `No available snippets for libraries in ${$workspace.name} project. Visit https://snipsnap.dev for more information.`
    );
  }
};

// reject for thenables
const thenableOnReject = (e) => {
  throw e;
};

const ignoreSpecifiedLibs = curry(($workspace, depsList) =>
  getWorkspaceFile($workspace, '.snipsnapignore.json')
    .then((uri) => getFileContent($workspace, uri[0]))
    // filtering out to-be-ignored-files
    .then((res) => depsList.filter((dep) => !res.includes(dep)))
    // return initial deps list anyway
    .catch(() => depsList)
);

// scans for yarn.lock and package-lock.json files and returns its deps
const getSubDependencies = curry(($workspace, mainDepsArray) =>
  $workspace
    .findFiles('yarn.lock', 1)
    .then((res) => (res.length ? getYarnLockFileContent($workspace, res[0]) : []))
    .then((yarnRes) =>
      $workspace
        .findFiles('package-lock.json', 1)
        .then((res) => (res.length ? getFileContent($workspace, res[0]) : { dependencies: [] }))
        .then((pckgRes) => {
          // eslint-disable-next-line no-console
          console.debug('yarn.lock packages:', yarnRes);
          // eslint-disable-next-line no-console
          console.debug('package-lock packages:', pckgRes);
          return ignoreSpecifiedLibs(
            $workspace,
            compose(uniqify, transformSubModules)([...mainDepsArray, ...yarnRes, ...Object.keys(pckgRes.dependencies)])
          );
        })
    )
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
  getYarnLockFileContent,
};
