<p align="center">
<img width="100" src="https://user-images.githubusercontent.com/2697570/85011968-9ac90c80-b162-11ea-9960-1429cb5f409f.png" alt="Snipsnap Logo"/></p>

<h1 align="center">Snipsnap VS Code extension</h1>
<h3 align="center">The ultimate snippets collection and VS Code extension that automatically exposes all available snippets for every library you are using in your project.</h3>
<p align="center"><a href="https://github.com/snipsnapdev/snipsnap">Read More</a></p>

![out](https://user-images.githubusercontent.com/2697570/73568644-23bc0180-4469-11ea-8b64-843c7a9a92d2.gif)


<p align="center">
  <a href="https://drone.pixelpoint.io/snipsnapdev/snipsnap-vscode"><img src="https://img.shields.io/drone/build/snipsnapdev/snipsnap-vscode?server=https%3A%2F%2Fdrone.pixelpoint.io" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=snipsnapdev.snipsnap-vscode">
    <img alt="VS Code Marketplace" src="https://img.shields.io/visual-studio-marketplace/v/snipsnapdev.snipsnap-vscode"></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=snipsnapdev.snipsnap-vscode">
    <img alt="VS Code Marketplace Downloads" src="https://img.shields.io/visual-studio-marketplace/d/snipsnapdev.snipsnap-vscode"></a>
</p>

<h2 align="center">Popular snippets</h2>
<table>
  <tbody>
    <td valign="middle" align="center">
<img width="100px" src="https://user-images.githubusercontent.com/2697570/82653674-db933b80-9c1f-11ea-9731-7b8e0d1ab05c.png" />
      <br>React
    </td>
    <td valign="middle" align="center"><img width="100px" src="https://user-images.githubusercontent.com/2697570/82653826-15644200-9c20-11ea-8fe8-b0db379c83a3.png"/>
      <br>Vue
    </td>
        <td valign="middle" align="center"><img width="100px" src="https://user-images.githubusercontent.com/2697570/82654143-90c5f380-9c20-11ea-9587-928a51c06839.png"/>
          <br>Gatsby
    </td>
    </td>
        <td valign="middle" align="center"><img width="100px" src="https://user-images.githubusercontent.com/2697570/85003657-c8a85400-b156-11ea-938e-8577eea635a6.jpg"/>
          <br>Next.js
    </td>
            <td valign="middle" align="center"><img width="100px" src="https://user-images.githubusercontent.com/2697570/82654470-147fe000-9c21-11ea-9975-a79b3721b8f6.png"/>
              <br>Redux
    </td>
                <td valign="middle" align="center"><img width="100px" src="https://user-images.githubusercontent.com/2697570/82654869-a2f46180-9c21-11ea-8034-71f63bcd8389.png"/>
              <br>Styled components
    </td>
    </tbody>
</table>

## Want to know more?

All information about the project presents in main Snipsnap repository.

**[Visit documentation](https://github.com/snipsnapdev/snipsnap)**

## Installation

Install through VS Code extensions. Search for `Snipsnap - Snippets Handler`

[Visual Studio Code Market Place: Snipsnap - snippets handler](https://marketplace.visualstudio.com/items?itemName=snipsnapdev.snippsnap-vscode)

Can also be installed in VS Code: Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter.

```
ext install snipsnap-vscode
```

## Configuration

No config required and more than that - no config even exists! You are good to go right after installing the extension.

## Usage

No manual activation required as well, the extension triggers if your workspace folder contains `package.json` file and does magic on its own, but if you still need to trigger it, use `Reload Window` in Command Palette.

## Settings

The only available configuration option is possibility to exclude certain libraries from snippets request.

Snipsnap works by gathering all deps throughout the project, even from lock files, so some of subdependencies like lodash could pollute your snippet environment and become a major frustrating factor.

To ensure that no `%unwanted_library%` snippets are being fetched, you should create `.snipsnapignore.json` file at the root of your project and specify all libraries you want to be ignored in a single list, e.g.

```json
["react", "lodash", "html"]
```

## Error Messages

Reload using Command Paletter or just reload the window. If the problem hasn't dissapeared, please, [submit an issue with a description](https://github.com/snipsnapdev/snipsnap-vscode/issues).

## Telemetry

This extension respects the VS Code telemetry setting so if you have telemetry disabled in VS Code we will also not collect telemetry. See the [Visual Studio Code docs](https://code.visualstudio.com/docs/getstarted/telemetry#_disable-telemetry-reporting) for information on how to disable telemetry.

However, at this point 0 telemetry data is being gathered if you did not tweaked vscode telemetry settings.

## License

MIT
