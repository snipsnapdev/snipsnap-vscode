const https = require('https');
/* eslint-disable-next-line import/no-unresolved */
const { Uri, window, workspace } = require('vscode');
// @TODO: for some reason even simple importing this 3rd party
// breaks the extension
// const lockfile = require('@yarnpkg/lockfile');
const { ifElse, curry, uniqify, compose } = require('./common');

// filters all dep names with @ or / in the name
// removeSubModules(arr: Array) -> Array
const removeSubModules = (arr) =>
  arr.filter((key) => !RegExp('[@/]', 'g').test(key));

// converts @angular/core into angular, @storybook/react into storybook
const transformSubModules = (arr) => arr.map((key) => {
  if (key[0] === '@') {
    const slashPosition = key.indexOf('/');
    return key.slice(1, slashPosition);
  }
  return key;
});

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
    $workspace.name // workspace is open
      ? $workspace.findFiles('package.json', 1).then(resolve, reject)
      : reject(Error('No workspace is open'))
  );

// takes a filename and returns Promise obj with Uri
// (fileName: String) -> Thenable<Uri>
const getWorkspaceFile = curry(($workspace, fileName = '') =>
  $workspace.findFiles(fileName, 1)
);

// takes an Uri and parses content of a file
// getFileContent($workspace: vscode.workspace, uri: Object) -> JSON
const getFileContent = curry(($workspace, packageUri) =>
  $workspace.fs.readFile(packageUri).then(Buffer.from).then(JSON.parse)
);

const getYarnLockFileContent = curry(($workspace, lockFileUri) =>
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
  const wPath = Uri.file(
    `${$workspace.workspaceFolders[0].uri.fsPath}/.vscode/snipsnap.code-snippets`
  );
  if (snippetsData.length > 2) {
    // check if there is only {} in response string
    // writing fetched snippets data to the code-snippets file
    $workspace.fs.writeFile(wPath, Buffer.from(snippetsData, 'utf8'));
    brandMessage(
      `Snippets successfully fetched! You are using the latest snippets available for ${$workspace.name} project.`
    );
  } else {
    brandMessage(
      `No available snippets for libraries in ${$workspace.name} project. Visit https://snipsnap.dev for more information.`
    );
  }
};

// errorThrower for thenable objects
const thenableOnReject = handleErrors;

const ignoreSpecifiedLibs = curry(($workspace, depsList) =>
  getWorkspaceFile($workspace, '.snipsnapignore.json')
    .then((uri) => getFileContent($workspace, uri[0]))
    // filtering out to-be-ignored-files
    .then((res) => depsList.filter((dep) => !res.includes(dep)))
    // logging error out but return initial deps list
    .catch((err) => depsList)
);

// scans for yarn.lock and package-lock.json files and returns its deps
const getSubDependencies = curry(($workspace, mainDepsArray) =>
  // .findFiles('yarn.lock', 1)
  // .then((res) =>
  //   res.length ? getYarnLockFileContent($workspace, res[0]) : '{}'
  // )
  // .then((yarnRes) =>
  $workspace
    .findFiles('package-lock.json', 1)
    .then((res) => (res.length ? getFileContent($workspace, res[0]) : '{}'))
    .then((pckgRes) =>
      ignoreSpecifiedLibs(
        $workspace,
        uniqify(
          transformSubModules([
            ...mainDepsArray,
            // ...Object.keys(yarnRes.object || {}),
            ...Object.keys(pckgRes.dependencies || {}),
          ]),
        ),
      )
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
