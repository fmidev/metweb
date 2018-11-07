#metweb
===========

> Weather map animator

## Requirements
You only need <b>node.js</b> pre-installed and you’re good to go. 

## Setup
Install dependencies
```sh
$ npm install
```

## Development
Run the local webpack-dev-server with livereload and autocompile on [http://localhost:8080/](http://localhost:8080/)
```sh
$ npm run dev
```
Run language specific versions with
```sh
$ npm run <fi|en>
```

## Deployment
Build the current application
```sh
$ npm run build
```

## [webpack](https://webpack.js.org/)
The [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) will serve the static files in your build folder and watch your source files for changes.
When changes are made the bundle will be recompiled. This modified bundle is served from memory at the relative path specified in publicPath.
