const window = {
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  showInformationMessage: jest.fn(),
};

const context = {
  subscriptions: [],
};

const workspace = {
  workspaceFolders: [],
  getWorkspaceFolder: jest.fn(),
  name: undefined,
  fs: {
    findFiles: jest.fn().mockResolvedValue({
      path: 'test-workspace-folder/package.json',
      scheme: 'file',
    }),
  },
};

// const Uri = {
//   file: f => f,
//   parse: jest.fn(),
// }

const commands = {
  executeCommand: jest.fn(),
  registerCommand: jest.fn(),
};

module.exports = {
  window,
  workspace,
  // Uri,
  commands,
  context,
};
