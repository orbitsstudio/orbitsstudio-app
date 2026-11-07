/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "index.html",
    "revision": "e9861438ba3ca83797997ccabd02bba1"
  }, {
    "url": "icon.svg",
    "revision": "e47d8608a143bf87a2f362a34ba1eb56"
  }, {
    "url": "icon-512.png",
    "revision": "f829b914fc47cfc9c0747c119c27cf1b"
  }, {
    "url": "icon-192.png",
    "revision": "f829b914fc47cfc9c0747c119c27cf1b"
  }, {
    "url": "404.html",
    "revision": "bbbe588a45a6b30fe313498803569dd2"
  }, {
    "url": "assets/index-pnKnOkwr.js",
    "revision": null
  }, {
    "url": "assets/index-C9n6a1Sz.css",
    "revision": null
  }, {
    "url": "icon-192.png",
    "revision": "f829b914fc47cfc9c0747c119c27cf1b"
  }, {
    "url": "icon-512.png",
    "revision": "f829b914fc47cfc9c0747c119c27cf1b"
  }, {
    "url": "icon.svg",
    "revision": "e47d8608a143bf87a2f362a34ba1eb56"
  }, {
    "url": "manifest.webmanifest",
    "revision": "f61bc37c46b3c2c9d089a8d9ea5fcd44"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
