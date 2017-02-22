1. Instructions
___

```shell
bin: npm i | yarn
bin: touch github-config.ts
bin: code github-config.ts
```
add following code into:

```js
export class GithubConfig{
    static token = 'token'; // oauth
    static username = 'username'; // basicAuth
    static password = 'secret'; // basicAuth
    static repoOwner = 'fuse-box';
    static repoName = 'fuse-box';
}
```

start building/watching

```shell

bin: npm start // build the ts files to js

```

run
```shell
bin: node | nodemon run changelog -B | basic-auth | -O | oauth
```

Available arguments: 
- Basic auth : `-B` or `basic-auth`
- Oauth:   `-O` or `oauth`

Vscode Launch task for debugging

```json
//basic auth
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Changelog",
      "args": [
        "-B"
      ],
      "program": "${workspaceRoot}/bin/changelog/changelog.js",
      "cwd": "${workspaceRoot}/bin",
      "outFiles": []
    }
  ]
}

// Oauth
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Changelog",
      "args": [
        "-O"
      ],
      "program": "${workspaceRoot}/bin/changelog/changelog.js",
      "cwd": "${workspaceRoot}/bin",
      "outFiles": []
    }
  ]
}
```
