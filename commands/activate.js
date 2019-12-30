const {
  fetchSnippets,
  handleErrors,
  getFileContent,
  injectSnippetFile,
  thenableOnReject,
} = require('../helpers/local'); // fetchSnippets

// snipsnap_activate command handler
const snipsnapActivate = (workspace, packageUri) => {
  // reading package.json content
  // try/catch because vscode's thenable have no catch method
  try {
    getFileContent(workspace, packageUri)
      .then((packageContent) => {
        // getting the content of package.json
        const { dependencies = {}, devDependencies = {} } = packageContent;

        // creating list of all project libraries
        const librariesInUse = Array.from(
          new Set([
            ...Object.keys(dependencies),
            ...Object.keys(devDependencies),
          ])
        );

        /*
         * get ready for an API call
         */

        const reqPayload = JSON.stringify({
          // TODO: think of a way of handling lang other than js
          language: 'javascript',
          ide: 'vscode',
          // TODO: think of a way of filtering snippetless packages, e.g. sharp
          packages: librariesInUse,
        });

        // making an API call
        return fetchSnippets(
          {
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(reqPayload),
            },
          },
          reqPayload
        );
      }, thenableOnReject)
      .then(injectSnippetFile(workspace), thenableOnReject);
  } catch (e) {
    handleErrors(e);
  }
};

module.exports = snipsnapActivate;
