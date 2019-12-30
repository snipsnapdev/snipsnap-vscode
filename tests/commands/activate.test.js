/* eslint-disable-next-line import/no-unresolved */
const vscode = require('vscode');
const snipsnapActivate = require('../../commands/activate');
const {
  handleErrors,
  thenableOnReject,
  fetchSnippets,
  getFileContent,
  injectSnippetFile,
} = require('../../helpers/local');

jest.mock('../../helpers/local', () => ({
  handleErrors: jest.fn(),
  thenableOnReject: jest.fn().mockResolvedValue({ err: 'test-error' }),
  getFileContent: jest
    .fn()
    .mockResolvedValue({ devDependencies: { react: '17.0.1' } }),
  fetchSnippets: jest
    .fn()
    .mockResolvedValue(JSON.stringify({ val1: 1, val2: 2 })),
  injectSnippetFile: jest.fn().mockResolvedValue({}),
}));

describe('Activation command test suite', () => {
  // should be moved to test suite for getFileContent
  test('Activation error when no workspace is passed are being handled', () => {
    expect(() => snipsnapActivate(undefined, { path: 'test/file/path', scheme: 'file' })).not.toThrow();
    expect(handleErrors).toHaveBeenCalled();
    expect(thenableOnReject).not.toHaveBeenCalled();
  });
  // should be moved to test suite for getFileContent
  test('Activation error when no packageUri is passed are being handled', () => {
    expect(() => snipsnapActivate(vscode.workspace, undefined)).not.toThrow();
    expect(handleErrors).toHaveBeenCalled();
    expect(thenableOnReject).not.toHaveBeenCalled();
  });
  test('snipsnapActivate successfully handles happy path', () => {
    snipsnapActivate(vscode.workspace, {
      path: 'test/file/path',
      scheme: 'file',
    });
    // expect(handleErrors).not.toHaveBeenCalled();
    expect(thenableOnReject).not.toHaveBeenCalled();
    expect(getFileContent).toHaveBeenCalledTimes(1);
    // expect(fetchSnippets).toHaveBeenCalledTimes(1);
    // expect(injectSnippetFile).toHaveBeenCalledTimes(1);
  });
});
