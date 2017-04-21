SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "github:": "jspm_packages/github/"
  },
  browserConfig: {
    "baseURL": "/",
    "paths": {
      "cross/": "app/"
    }
  },
  nodeConfig: {
    "paths": {
      "cross/": ""
    }
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.21"
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "cross": {
      "main": "app/app.js",
      "defaultExtension": "js",
      "meta": {
        "*.js": {
          "loader": "plugin-babel"
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "assert": "npm:jspm-nodelibs-assert@0.2.1",
    "bulma": "npm:bulma@0.4.0",
    "child_process": "npm:jspm-nodelibs-child_process@0.2.1",
    "css": "github:systemjs/plugin-css@0.1.33",
    "dragula": "npm:dragula@3.7.2",
    "fs": "npm:jspm-nodelibs-fs@0.2.1",
    "normalize.css": "npm:normalize.css@6.0.0",
    "path": "npm:jspm-nodelibs-path@0.2.3",
    "process": "npm:jspm-nodelibs-process@0.2.1",
    "text": "github:systemjs/plugin-text@0.0.9",
    "webcomponents-lite": "npm:webcomponents-lite@0.6.0"
  },
  packages: {
    "npm:dragula@3.7.2": {
      "map": {
        "contra": "npm:contra@1.9.4",
        "crossvent": "npm:crossvent@1.5.4"
      }
    },
    "npm:crossvent@1.5.4": {
      "map": {
        "custom-event": "npm:custom-event@1.0.0"
      }
    },
    "npm:contra@1.9.4": {
      "map": {
        "atoa": "npm:atoa@1.0.0",
        "ticky": "npm:ticky@1.0.1"
      }
    }
  }
});
