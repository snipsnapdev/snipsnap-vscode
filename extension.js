// eslint-disable-next-line import/no-unresolved
const { commands, workspace } = require('vscode');
const {
  fetchSnippets,
  checkInitialActivationConditions,
  handleErrors,
  brandMessage,
} = require('./helpers/local'); // fetchSnippets
const snipsnapActivate = require('./commands/activate');

function activate(context, snippetFetcher = fetchSnippets) {
  checkInitialActivationConditions(workspace)
    .then((packageUri) => {
      // command registration
      const disposable = commands.registerCommand(
        'extension.snipsnap_activate',
        () => snipsnapActivate(workspace, packageUri[0], snippetFetcher)
      );

      context.subscriptions.push(disposable);
      // activating main fn right away
      commands.executeCommand('extension.snipsnap_activate');
    })
    .catch(handleErrors);
}

exports.activate = activate;

function deactivate() {
  brandMessage('The extension is turned off.');
}

module.exports = {
  activate,
  deactivate,
};
