System.registerDynamic("npm:systemjs-plugin-babel@0.0.21.json", [], true, function() {
  return {
    "main": "plugin-babel.js",
    "map": {
      "systemjs-babel-build": {
        "browser": "./systemjs-babel-browser.js",
        "default": "./systemjs-babel-browser.js"
      }
    },
    "meta": {
      "./plugin-babel.js": {
        "format": "cjs"
      }
    }
  };
});

System.registerDynamic("github:systemjs/plugin-css@0.1.33.json", [], true, function() {
  return {
    "main": "css"
  };
});

System.registerDynamic("cross/css/app.css!github:systemjs/plugin-css@0.1.33/css.js", [], false, function ($__require, $__exports, $__module) {
  var _retrieveGlobal = System.registry.get("@@global-helpers").prepareGlobal($__module.id, null, null);

  (function ($__global) {})(this);

  return _retrieveGlobal();
});
System.register('cross/index.js', ['./css/app.css!'], function (_export, _context) {
  "use strict";

  return {
    setters: [function (_cssAppCss) {}],
    execute: function () {}
  };
});
(function(c){if (typeof document == 'undefined') return; var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[a](d.createTextNode(c));})
("body,html{margin:0;padding:0;background:#eee}\n/*# sourceMappingURL=__.css.map */");
//# sourceMappingURL=build.js.map