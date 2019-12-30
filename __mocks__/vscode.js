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
    writeFile: jest.fn().mockResolvedValue({}),
    readFile: jest
      .fn()
      .mockResolvedValue(
        JSON.stringify({ devDependencies: { react: '17.0.1' } })
      ),
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
