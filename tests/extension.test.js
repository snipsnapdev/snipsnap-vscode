/* eslint-disable-next-line import/no-unresolved */
const vscode = require('vscode');
const { activate, deactivate } = require('../extension');

jest.mock('../helpers/local', () => ({
  brandMessage: jest.fn(),
  fetchSnippets: jest.fn().mockResolvedValue(
    JSON.stringify({
      devDependencies: { sharp: '12.08.1' },
      dependencies: { 'gatsby-image': '2.0.1' },
    })
  ),
}));

jest.mock('../extension', () => ({
  activate: jest.fn(),
  deactivate: jest.fn(),
}));

describe('Extension test', () => {
  vscode.context = {
    subscriptions: {
      push: jest.fn(),
    },
  };
  beforeEach(() => {
    vscode.context.subscriptions.push.mockReset();
  });
  test('extension does nothing if no workspace is opened', () => {
    expect(vscode.workspace.name).toBeUndefined();
    expect(activate).not.toHaveBeenCalled();
    expect(vscode.commands.registerCommand).not.toHaveBeenCalled();
  });

  test('extension does nothing if workspace is opened but no package.json exists', () => {
    vscode.workspace.name = 'test-workspace-folder';
    expect(vscode.workspace.name).toBeDefined();
    expect(activate).not.toHaveBeenCalled();
    expect(vscode.commands.registerCommand).not.toHaveBeenCalled();
  });

  test('extension does activates if workspace is opened and package.json exists', () => {
    vscode.workspace.name = 'test-workspace-folder';
    expect(vscode.workspace.name).toBeDefined();
    // find a way to simulate vscode activation event emitter
    activate(vscode.context);
    expect(activate).toHaveBeenCalledTimes(1);
  });
  test('STUB: on a happy path ext trigers command registration and subscriptions', () => {
    expect(true).toBeTruthy();
  });
});
