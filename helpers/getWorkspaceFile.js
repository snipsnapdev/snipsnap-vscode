// eslint-disable-next-line import/no-unresolved
const vscode = require('vscode');

// takes a filename and returns Promise obj
// (fileName: String) -> Promise
module.exports = (fileName = '') => vscode.workspace.findFiles(fileName, 1);
