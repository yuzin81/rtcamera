// We don't use the platform bootstrapper, so fake this stuff.

window.Platform = {};
var logFlags = {};
/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

// SideTable is a weak map where possible. If WeakMap is not available the
// association is stored as an expando property.
var SideTable;
// TODO(arv): WeakMap does not allow for Node etc to be keys in Firefox
if (typeof WeakMap !== 'undefined' && navigator.userAgent.indexOf('Firefox/') < 0) {
  SideTable = WeakMap;
} else {
  (function() {
    var defineProperty = Object.defineProperty;
    var hasOwnProperty = Object.hasOwnProperty;
    var counter = new Date().getTime() % 1e9;

    SideTable = function() {
      this.name = '__st' + (Math.random() * 1e9 >>> 0) + (counter++ + '__');
    };

    SideTable.prototype = {
      set: function(key, value) {
        defineProperty(key, this.name, {value: value, writable: true});
      },
      get: function(key) {
        return hasOwnProperty.call(key, this.name) ? key[this.name] : undefined;
      },
      delete: function(key) {
        this.set(key, undefined);
      }
    }
  })();
}

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function() {

  // poor man's adapter for template.content on various platform scenarios
  window.templateContent = window.templateContent || function(inTemplate) {
    return inTemplate.content;
  };

  // so we can call wrap/unwrap without testing for ShadowDOMPolyfill

  window.wrap = window.unwrap = function(n){
    return n;
  }

  window.createShadowRoot = function(inElement) {
    return inElement.webkitCreateShadowRoot();
  };

  window.templateContent = function(inTemplate) {
    // if MDV exists, it may need to boostrap this template to reveal content
    if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
      HTMLTemplateElement.bootstrap(inTemplate);
    }
    // fallback when there is no Shadow DOM polyfill, no MDV polyfill, and no
    // native template support
    if (!inTemplate.content && !inTemplate._content) {
      var frag = document.createDocumentFragment();
      while (inTemplate.firstChild) {
        frag.appendChild(inTemplate.firstChild);
      }
      inTemplate._content = frag;
    }
    return inTemplate.content || inTemplate._content;
  };

})();
/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

// Old versions of iOS do not have bind.

if (!Function.prototype.bind) {
  Function.prototype.bind = function(scope) {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
      var args2 = args.slice();
      args2.push.apply(args2, arguments);
      return self.apply(scope, args2);
    };
  };
}

// namespace an import from CustomElements
// TODO(sjmiles): clean up this global
scope.mixin = window.mixin;

})(window.Platform);
// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function(scope) {

  'use strict';

  // polyfill DOMTokenList
  // * add/remove: allow these methods to take multiple classNames
  // * toggle: add a 2nd argument which forces the given state rather
  //  than toggling.

  var add = DOMTokenList.prototype.add;
  var remove = DOMTokenList.prototype.remove;
  DOMTokenList.prototype.add = function() {
    for (var i = 0; i < arguments.length; i++) {
      add.call(this, arguments[i]);
    }
  };
  DOMTokenList.prototype.remove = function() {
    for (var i = 0; i < arguments.length; i++) {
      remove.call(this, arguments[i]);
    }
  };
  DOMTokenList.prototype.toggle = function(name, bool) {
    if (arguments.length == 1) {
      bool = !this.contains(name);
    }
    bool ? this.add(name) : this.remove(name);
  };
  DOMTokenList.prototype.switch = function(oldName, newName) {
    oldName && this.remove(oldName);
    newName && this.add(newName);
  };

  // make forEach work on NodeList

  NodeList.prototype.forEach = function(cb, context) {
    Array.prototype.slice.call(this).forEach(cb, context);
  };

  HTMLCollection.prototype.forEach = function(cb, context) {
    Array.prototype.slice.call(this).forEach(cb, context);
  };

  // polyfill performance.now

  if (!window.performance) {
    var start = Date.now();
    // only at millisecond precision
    window.performance = {now: function(){ return Date.now() - start }};
  }

  // polyfill for requestAnimationFrame

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
      var nativeRaf = window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;

      return nativeRaf ?
        function(callback) {
          return nativeRaf(function() {
            callback(performance.now());
          });
        } :
        function( callback ){
          return window.setTimeout(callback, 1000 / 60);
        };
    })();
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = (function() {
      return  window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        function(id) {
          clearTimeout(id);
        };
    })();
  }

  // utility

  function createDOM(inTagOrNode, inHTML, inAttrs) {
    var dom = typeof inTagOrNode == 'string' ?
        document.createElement(inTagOrNode) : inTagOrNode.cloneNode(true);
    dom.innerHTML = inHTML;
    if (inAttrs) {
      for (var n in inAttrs) {
        dom.setAttribute(n, inAttrs[n]);
      }
    }
    return dom;
  }

  // exports

  scope.createDOM = createDOM;

})(window.Platform);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// poor man's adapter for template.content on various platform scenarios
window.templateContent = window.templateContent || function(inTemplate) {
  return inTemplate.content;
};
/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {

if (!scope) {
  scope = window.HTMLImports = {flags:{}};
}

var IMPORT_LINK_TYPE = 'import';

// highlander object represents a primary document (the argument to 'parse')
// at the root of a tree of documents

var importer = {
  documents: {},
  cache: {},
  preloadSelectors: [
    'link[rel=' + IMPORT_LINK_TYPE + ']',
    'script[src]',
    'link[rel=stylesheet]'
  ].join(','),
  load: function(inDocument, inNext) {
    // construct a loader instance
    loader = new Loader(importer.loaded, inNext);
    // alias the loader cache (for debugging)
    loader.cache = importer.cache;
    // add nodes from document into loader queue
    importer.preload(inDocument);
  },
  preload: function(inDocument) {
    // all preloadable nodes in inDocument
    var nodes = inDocument.querySelectorAll(importer.preloadSelectors);
    // only load imports from the main document
    // TODO(sjmiles): do this by altering the selector list instead
    if (inDocument === document) {
      nodes = Array.prototype.filter.call(nodes, function(n) {
        return isDocumentLink(n);
      });
    }
    // add these nodes to loader's queue
    loader.addNodes(nodes);
  },
  loaded: function(inUrl, inElt, inResource) {
    if (isDocumentLink(inElt)) {
      var document = importer.documents[inUrl];
      // if we've never seen a document at this url
      if (!document) {
        // generate an HTMLDocument from data
        document = makeDocument(inResource, inUrl);
        // resolve resource paths relative to host document
        path.resolvePathsInHTML(document);
        // cache document
        importer.documents[inUrl] = document;
        // add nodes from this document to the loader queue
        importer.preload(document);
      }
      // store document resource
      inElt.content = inElt.__resource = document;
    } else {
      inElt.__resource = inResource;
      // resolve stylesheet resource paths relative to host document
      if (isStylesheetLink(inElt)) {
        path.resolvePathsInStylesheet(inElt);
      }
    }
  }
};

function isDocumentLink(inElt) {
  return isLinkRel(inElt, IMPORT_LINK_TYPE);
}

function isStylesheetLink(inElt) {
  return isLinkRel(inElt, 'stylesheet');
}

function isLinkRel(inElt, inRel) {
  return (inElt.localName === 'link' && inElt.getAttribute('rel') === inRel);
}

function inMainDocument(inElt) {
  return inElt.ownerDocument === document ||
    // TODO(sjmiles): ShadowDOMPolyfill intrusion
    inElt.ownerDocument.impl === document;
}

function makeDocument(inHTML, inUrl) {
  // create a new HTML document
  var doc = document.implementation.createHTMLDocument(IMPORT_LINK_TYPE);
  // cache the new document's source url
  doc._URL = inUrl;
  // establish a relative path via <base>
  var base = doc.createElement('base');
  base.setAttribute('href', document.baseURI);
  doc.head.appendChild(base);
  // install html
  doc.body.innerHTML = inHTML;
  return doc;
}

var loader;

var Loader = function(inOnLoad, inOnComplete) {
  this.onload = inOnLoad;
  this.oncomplete = inOnComplete;
  this.inflight = 0;
  this.pending = {};
  this.cache = {};
};

Loader.prototype = {
  addNodes: function(inNodes) {
    // number of transactions to complete
    this.inflight += inNodes.length;
    // commence transactions
    forEach(inNodes, this.require, this);
    // anything to do?
    this.checkDone();
  },
  require: function(inElt) {
    var url = path.nodeUrl(inElt);
    // TODO(sjmiles): ad-hoc
    inElt.__nodeUrl = url;
    // deduplication
    if (!this.dedupe(url, inElt)) {
      // fetch this resource
      this.fetch(url, inElt);
    }
  },
  dedupe: function(inUrl, inElt) {
    if (this.pending[inUrl]) {
      // add to list of nodes waiting for inUrl
      this.pending[inUrl].push(inElt);
      // don't need fetch
      return true;
    }
    if (this.cache[inUrl]) {
      // complete load using cache data
      this.onload(inUrl, inElt, loader.cache[inUrl]);
      // finished this transaction
      this.tail();
      // don't need fetch
      return true;
    }
    // first node waiting for inUrl
    this.pending[inUrl] = [inElt];
    // need fetch (not a dupe)
    return false;
  },
  fetch: function(inUrl, inElt) {
    xhr.load(inUrl, function(err, resource) {
      this.receive(inUrl, inElt, err, resource);
    }.bind(this));
  },
  receive: function(inUrl, inElt, inErr, inResource) {
    if (!inErr) {
      loader.cache[inUrl] = inResource;
    }
    loader.pending[inUrl].forEach(function(e) {
      if (!inErr) {
        this.onload(inUrl, e, inResource);
      }
      this.tail();
    }, this);
    loader.pending[inUrl] = null;
  },
  tail: function() {
    --this.inflight;
    this.checkDone();
  },
  checkDone: function() {
    if (!this.inflight) {
      this.oncomplete();
    }
  }
};

var path = {
  nodeUrl: function(inNode) {
    return path.resolveUrl(path.getDocumentUrl(document), path.hrefOrSrc(inNode));
  },
  hrefOrSrc: function(inNode) {
    return inNode.getAttribute("href") || inNode.getAttribute("src");
  },
  documentUrlFromNode: function(inNode) {
    return path.getDocumentUrl(inNode.ownerDocument);
  },
  getDocumentUrl: function(inDocument) {
    var url = inDocument &&
        // TODO(sjmiles): ShadowDOMPolyfill intrusion
        (inDocument._URL || (inDocument.impl && inDocument.impl._URL)
            || inDocument.baseURI || inDocument.URL)
                || '';
    // take only the left side if there is a #
    return url.split('#')[0];
  },
  resolveUrl: function(inBaseUrl, inUrl, inRelativeToDocument) {
    if (this.isAbsUrl(inUrl)) {
      return inUrl;
    }
    var url = this.compressUrl(this.urlToPath(inBaseUrl) + inUrl);
    if (inRelativeToDocument) {
      url = path.makeRelPath(path.getDocumentUrl(document), url);
    }
    return url;
  },
  isAbsUrl: function(inUrl) {
    return /(^data:)|(^http[s]?:)|(^\/)/.test(inUrl);
  },
  urlToPath: function(inBaseUrl) {
    var parts = inBaseUrl.split("/");
    parts.pop();
    parts.push('');
    return parts.join("/");
  },
  compressUrl: function(inUrl) {
    var parts = inUrl.split("/");
    for (var i=0, p; i<parts.length; i++) {
      p = parts[i];
      if (p === "..") {
        parts.splice(i-1, 2);
        i -= 2;
      }
    }
    return parts.join("/");
  },
  // make a relative path from source to target
  makeRelPath: function(inSource, inTarget) {
    var s, t;
    s = this.compressUrl(inSource).split("/");
    t = this.compressUrl(inTarget).split("/");
    while (s.length && s[0] === t[0]){
      s.shift();
      t.shift();
    }
    for(var i = 0, l = s.length-1; i < l; i++) {
      t.unshift("..");
    }
    var r = t.join("/");
    return r;
  },
  resolvePathsInHTML: function(inRoot) {
    var docUrl = path.documentUrlFromNode(inRoot.body);
    // TODO(sorvell): MDV Polyfill Intrusion
    if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
      HTMLTemplateElement.bootstrap(inRoot);
    }
    var node = inRoot.body;
    path._resolvePathsInHTML(node, docUrl);
  },
  _resolvePathsInHTML: function(inRoot, inUrl) {
    path.resolveAttributes(inRoot, inUrl);
    path.resolveStyleElts(inRoot, inUrl);
    // handle templates, if supported
    if (window.templateContent) {
      var templates = inRoot.querySelectorAll('template');
      if (templates) {
        forEach(templates, function(t) {
          path._resolvePathsInHTML(templateContent(t), inUrl);
        });
      }
    }
  },
  resolvePathsInStylesheet: function(inSheet) {
    var docUrl = path.nodeUrl(inSheet);
    inSheet.__resource = path.resolveCssText(inSheet.__resource, docUrl);
  },
  resolveStyleElts: function(inRoot, inUrl) {
    var styles = inRoot.querySelectorAll('style');
    if (styles) {
      forEach(styles, function(style) {
        style.textContent = path.resolveCssText(style.textContent, inUrl);
      });
    }
  },
  resolveCssText: function(inCssText, inBaseUrl) {
    return inCssText.replace(/url\([^)]*\)/g, function(inMatch) {
      // find the url path, ignore quotes in url string
      var urlPath = inMatch.replace(/["']/g, "").slice(4, -1);
      urlPath = path.resolveUrl(inBaseUrl, urlPath, true);
      return "url(" + urlPath + ")";
    });
  },
  resolveAttributes: function(inRoot, inUrl) {
    // search for attributes that host urls
    var nodes = inRoot && inRoot.querySelectorAll(URL_ATTRS_SELECTOR);
    if (nodes) {
      forEach(nodes, function(n) {
        this.resolveNodeAttributes(n, inUrl);
      }, this);
    }
  },
  resolveNodeAttributes: function(inNode, inUrl) {
    URL_ATTRS.forEach(function(v) {
      var attr = inNode.attributes[v];
      if (attr && attr.value &&
         (attr.value.search(URL_TEMPLATE_SEARCH) < 0)) {
        var urlPath = path.resolveUrl(inUrl, attr.value, true);
        attr.value = urlPath;
      }
    });
  }
};

var URL_ATTRS = ['href', 'src', 'action'];
var URL_ATTRS_SELECTOR = '[' + URL_ATTRS.join('],[') + ']';
var URL_TEMPLATE_SEARCH = '{{.*}}';

var xhr = scope.xhr || {
  async: true,
  ok: function(inRequest) {
    return (inRequest.status >= 200 && inRequest.status < 300)
        || (inRequest.status === 304)
        || (inRequest.status === 0);
  },
  load: function(url, next, nextContext) {
    var request = new XMLHttpRequest();
    if (scope.flags.debug || scope.flags.bust) {
      url += '?' + Math.random();
    }
    request.open('GET', url, xhr.async);
    request.addEventListener('readystatechange', function(e) {
      if (request.readyState === 4) {
        next.call(nextContext, !xhr.ok(request) && request,
          request.response, url);
      }
    });
    request.send();
  }
};

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

// exports

scope.xhr = xhr;
scope.importer = importer;
scope.getDocumentUrl = path.getDocumentUrl;

// bootstrap

// IE shim for CustomEvent
if (typeof window.CustomEvent !== 'function') {
  window.CustomEvent = function(inType) {
     var e = document.createEvent('HTMLEvents');
     e.initEvent(inType, true, true);
     return e;
  };
}

document.addEventListener('DOMContentLoaded', function() {
  // preload document resource trees
  importer.load(document, function() {
    // TODO(sjmiles): ShadowDOM polyfill pollution
    var doc = window.ShadowDOMPolyfill ? ShadowDOMPolyfill.wrap(document)
        : document;
    HTMLImports.readyTime = new Date().getTime();
    // send HTMLImportsLoaded when finished
    doc.body.dispatchEvent(
      new CustomEvent('HTMLImportsLoaded', {bubbles: true})
    );
  });
});

})(window.HTMLImports);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

if (!window.MutationObserver) {
  window.MutationObserver =
      window.WebKitMutationObserver ||
      window.JsMutationObserver;
  if (!MutationObserver) {
    throw new Error("no mutation observer support");
  }
}

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * Implements `document.register`
 * @module CustomElements
*/

/**
 * Polyfilled extensions to the `document` object.
 * @class Document
*/

(function(scope) {

if (!scope) {
  scope = window.CustomElements = {flags:{}};
}

// native document.register?

scope.hasNative = (document.webkitRegister || document.register) && scope.flags.register === 'native';
if (scope.hasNative) {

  // normalize
  document.register = document.register || document.webkitRegister;

  var nop = function() {};

  // exports
  scope.registry = {};
  scope.upgradeElement = nop;

} else {

/**
 * Registers a custom tag name with the document.
 *
 * When a registered element is created, a `readyCallback` method is called
 * in the scope of the element. The `readyCallback` method can be specified on
 * either `inOptions.prototype` or `inOptions.lifecycle` with the latter taking
 * precedence.
 *
 * @method register
 * @param {String} inName The tag name to register. Must include a dash ('-'),
 *    for example 'x-component'.
 * @param {Object} inOptions
 *    @param {String} [inOptions.extends]
 *      (_off spec_) Tag name of an element to extend (or blank for a new
 *      element). This parameter is not part of the specification, but instead
 *      is a hint for the polyfill because the extendee is difficult to infer.
 *      Remember that the input prototype must chain to the extended element's
 *      prototype (or HTMLElement.prototype) regardless of the value of
 *      `extends`.
 *    @param {Object} inOptions.prototype The prototype to use for the new
 *      element. The prototype must inherit from HTMLElement.
 *    @param {Object} [inOptions.lifecycle]
 *      Callbacks that fire at important phases in the life of the custom
 *      element.
 *
 * @example
 *      FancyButton = document.register("fancy-button", {
 *        extends: 'button',
 *        prototype: Object.create(HTMLButtonElement.prototype, {
 *          readyCallback: {
 *            value: function() {
 *              console.log("a fancy-button was created",
 *            }
 *          }
 *        })
 *      });
 * @return {Function} Constructor for the newly registered type.
 */
function register(inName, inOptions) {
  //console.warn('document.register("' + inName + '", ', inOptions, ')');
  // construct a defintion out of options
  // TODO(sjmiles): probably should clone inOptions instead of mutating it
  var definition = inOptions || {};
  if (!inName) {
    // TODO(sjmiles): replace with more appropriate error (Erik can probably
    // offer guidance)
    throw new Error('Name argument must not be empty');
  }
  // record name
  definition.name = inName;
  // must have a prototype, default to an extension of HTMLElement
  // TODO(sjmiles): probably should throw if no prototype, check spec
  if (!definition.prototype) {
    // TODO(sjmiles): replace with more appropriate error (Erik can probably
    // offer guidance)
    throw new Error('Options missing required prototype property');
  }
  // ensure a lifecycle object so we don't have to null test it
  definition.lifecycle = definition.lifecycle || {};
  // build a list of ancestral custom elements (for native base detection)
  // TODO(sjmiles): we used to need to store this, but current code only
  // uses it in 'resolveTagName': it should probably be inlined
  definition.ancestry = ancestry(definition.extends);
  // extensions of native specializations of HTMLElement require localName
  // to remain native, and use secondary 'is' specifier for extension type
  resolveTagName(definition);
  // some platforms require modifications to the user-supplied prototype
  // chain
  resolvePrototypeChain(definition);
  // overrides to implement attributeChanged callback
  overrideAttributeApi(definition.prototype);
  // 7.1.5: Register the DEFINITION with DOCUMENT
  registerDefinition(inName, definition);
  // 7.1.7. Run custom element constructor generation algorithm with PROTOTYPE
  // 7.1.8. Return the output of the previous step.
  definition.ctor = generateConstructor(definition);
  definition.ctor.prototype = definition.prototype;
  // force our .constructor to be our actual constructor
  definition.prototype.constructor = definition.ctor;
  // if initial parsing is complete
  if (scope.ready) {
    // upgrade any pre-existing nodes of this type
    scope.upgradeAll(document);
  }
  return definition.ctor;
}

function ancestry(inExtends) {
  var extendee = registry[inExtends];
  if (extendee) {
    return ancestry(extendee.extends).concat([extendee]);
  }
  return [];
}

function resolveTagName(inDefinition) {
  // if we are explicitly extending something, that thing is our
  // baseTag, unless it represents a custom component
  var baseTag = inDefinition.extends;
  // if our ancestry includes custom components, we only have a
  // baseTag if one of them does
  for (var i=0, a; (a=inDefinition.ancestry[i]); i++) {
    baseTag = a.is && a.tag;
  }
  // our tag is our baseTag, if it exists, and otherwise just our name
  inDefinition.tag = baseTag || inDefinition.name;
  if (baseTag) {
    // if there is a base tag, use secondary 'is' specifier
    inDefinition.is = inDefinition.name;
  }
}

function resolvePrototypeChain(inDefinition) {
  // if we don't support __proto__ we need to locate the native level
  // prototype for precise mixing in
  if (!Object.__proto__) {
    // default prototype
    var native = HTMLElement.prototype;
    // work out prototype when using type-extension
    if (inDefinition.is) {
      var inst = document.createElement(inDefinition.tag);
      native = Object.getPrototypeOf(inst);
    }
  }
  // cache this in case of mixin
  inDefinition.native = native;
}

// SECTION 4

function instantiate(inDefinition) {
  // 4.a.1. Create a new object that implements PROTOTYPE
  // 4.a.2. Let ELEMENT by this new object
  //
  // the custom element instantiation algorithm must also ensure that the
  // output is a valid DOM element with the proper wrapper in place.
  //
  return upgrade(domCreateElement(inDefinition.tag), inDefinition);
}

function upgrade(inElement, inDefinition) {
  // some definitions specify an 'is' attribute
  if (inDefinition.is) {
    inElement.setAttribute('is', inDefinition.is);
  }
  // make 'element' implement inDefinition.prototype
  implement(inElement, inDefinition);
  // flag as upgraded
  inElement.__upgraded__ = true;
  // there should never be a shadow root on inElement at this point
  // we require child nodes be upgraded before ready
  scope.upgradeSubtree(inElement);
  // lifecycle management
  ready(inElement);
  // OUTPUT
  return inElement;
}

function implement(inElement, inDefinition) {
  // prototype swizzling is best
  if (Object.__proto__) {
    inElement.__proto__ = inDefinition.prototype;
  } else {
    // where above we can re-acquire inPrototype via
    // getPrototypeOf(Element), we cannot do so when
    // we use mixin, so we install a magic reference
    customMixin(inElement, inDefinition.prototype, inDefinition.native);
    inElement.__proto__ = inDefinition.prototype;
  }
}

function customMixin(inTarget, inSrc, inNative) {
  // TODO(sjmiles): 'used' allows us to only copy the 'youngest' version of
  // any property. This set should be precalculated. We also need to
  // consider this for supporting 'super'.
  var used = {};
  // start with inSrc
  var p = inSrc;
  // sometimes the default is HTMLUnknownElement.prototype instead of
  // HTMLElement.prototype, so we add a test
  // the idea is to avoid mixing in native prototypes, so adding
  // the second test is WLOG
  while (p !== inNative && p !== HTMLUnknownElement.prototype) {
    var keys = Object.getOwnPropertyNames(p);
    for (var i=0, k; k=keys[i]; i++) {
      if (!used[k]) {
        Object.defineProperty(inTarget, k,
            Object.getOwnPropertyDescriptor(p, k));
        used[k] = 1;
      }
    }
    p = Object.getPrototypeOf(p);
  }
}

function ready(inElement) {
  // invoke readyCallback
  if (inElement.readyCallback) {
    inElement.readyCallback();
  }
}

// attribute watching

function overrideAttributeApi(prototype) {
  // overrides to implement callbacks
  // TODO(sjmiles): should support access via .attributes NamedNodeMap
  // TODO(sjmiles): preserves user defined overrides, if any
  var setAttribute = prototype.setAttribute;
  prototype.setAttribute = function(name, value) {
    changeAttribute.call(this, name, value, setAttribute);
  }
  var removeAttribute = prototype.removeAttribute;
  prototype.removeAttribute = function(name, value) {
    changeAttribute.call(this, name, value, removeAttribute);
  }
}

function changeAttribute(name, value, operation) {
  var oldValue = this.getAttribute(name);
  operation.apply(this, arguments);
  if (this.attributeChangedCallback
      && (this.getAttribute(name) !== oldValue)) {
    this.attributeChangedCallback(name, oldValue);
  }
}

// element registry (maps tag names to definitions)

var registry = {};

function registerDefinition(inName, inDefinition) {
  registry[inName] = inDefinition;
}

function generateConstructor(inDefinition) {
  return function() {
    return instantiate(inDefinition);
  };
}

function createElement(inTag) {
  var definition = registry[inTag];
  if (definition) {
    return new definition.ctor();
  }
  return domCreateElement(inTag);
}

function upgradeElement(inElement) {
  if (!inElement.__upgraded__ && (inElement.nodeType === Node.ELEMENT_NODE)) {
    var type = inElement.getAttribute('is') || inElement.localName;
    var definition = registry[type];
    return definition && upgrade(inElement, definition);
  }
}

function cloneNode(deep) {
  // call original clone
  var n = domCloneNode.call(this, deep);
  // upgrade the element and subtree
  scope.upgradeAll(n);
  return n;
}
// capture native createElement before we override it

var domCreateElement = document.createElement.bind(document);

// capture native cloneNode before we override it

var domCloneNode = Node.prototype.cloneNode;

// exports

document.register = register;
document.createElement = createElement; // override
Node.prototype.cloneNode = cloneNode; // override

scope.registry = registry;

/**
 * Upgrade an element to a custom element. Upgrading an element
 * causes the custom prototype to be applied, an `is` attribute
 * to be attached (as needed), and invocation of the `readyCallback`.
 * `upgrade` does nothing if the element is already upgraded, or
 * if it matches no registered custom tag name.
 *
 * @method ugprade
 * @param {Element} inElement The element to upgrade.
 * @return {Element} The upgraded element.
 */
scope.upgrade = upgradeElement;

}

})(window.CustomElements);

 /*
Copyright 2013 The Polymer Authors. All rights reserved.
Use of this source code is governed by a BSD-style
license that can be found in the LICENSE file.
*/

(function(scope){

/*
if (HTMLElement.prototype.webkitShadowRoot) {
  Object.defineProperty(HTMLElement.prototype, 'shadowRoot', {
    get: function() {
      return this.webkitShadowRoot;
    }
  };
}
*/

// walk the subtree rooted at node, applying 'find(element, data)' function
// to each element
// if 'find' returns true for 'element', do not search element's subtree
function findAll(node, find, data) {
  var e = node.firstElementChild;
  if (!e) {
    e = node.firstChild;
    while (e && e.nodeType !== Node.ELEMENT_NODE) {
      e = e.nextSibling;
    }
  }
  while (e) {
    if (find(e, data) !== true) {
      findAll(e, find, data);
    }
    e = e.nextElementSibling;
  }
  return null;
}

// walk the subtree rooted at node, including descent into shadow-roots,
// applying 'cb' to each element
function forSubtree(node, cb) {
  //logFlags.dom && node.childNodes && node.childNodes.length && console.group('subTree: ', node);
  findAll(node, function(e) {
    if (cb(e)) {
      return true;
    }
    if (e.webkitShadowRoot) {
      forSubtree(e.webkitShadowRoot, cb);
    }
  });
  if (node.webkitShadowRoot) {
    forSubtree(node.webkitShadowRoot, cb);
  }
  //logFlags.dom && node.childNodes && node.childNodes.length && console.groupEnd();
}

// manage lifecycle on added node
function added(node) {
  if (upgrade(node)) {
    insertedNode(node);
    return true;
  }
  inserted(node);
}

// manage lifecycle on added node's subtree only
function addedSubtree(node) {
  forSubtree(node, function(e) {
    if (added(e)) {
      return true;
    }
  });
}

// manage lifecycle on added node and it's subtree
function addedNode(node) {
  return added(node) || addedSubtree(node);
}

// upgrade custom elements at node, if applicable
function upgrade(node) {
  if (!node.__upgraded__ && node.nodeType === Node.ELEMENT_NODE) {
    var type = node.getAttribute('is') || node.localName;
    var definition = scope.registry[type];
    if (definition) {
      logFlags.dom && console.group('upgrade:', node.localName);
      scope.upgrade(node);
      logFlags.dom && console.groupEnd();
      return true;
    }
  }
}

function insertedNode(node) {
  inserted(node);
  if (inDocument(node)) {
    forSubtree(node, function(e) {
      inserted(e);
    });
  }
}

// TODO(sjmiles): if there are descents into trees that can never have inDocument(*) true, fix this

function inserted(element) {
  // TODO(sjmiles): it's possible we were inserted and removed in the space
  // of one microtask, in which case we won't be 'inDocument' here
  // But there are other cases where we are testing for inserted without
  // specific knowledge of mutations, and must test 'inDocument' to determine
  // whether to call inserted
  // If we can factor these cases into separate code paths we can have
  // better diagnostics.
  // TODO(sjmiles): when logging, do work on all custom elements so we can
  // track behavior even when callbacks not defined
  //console.log('inserted: ', element.localName);
  if (element.insertedCallback || (element.__upgraded__ && logFlags.dom)) {
    logFlags.dom && console.group('inserted:', element.localName);
    if (inDocument(element)) {
      element.__inserted = (element.__inserted || 0) + 1;
      // if we are in a 'removed' state, bluntly adjust to an 'inserted' state
      if (element.__inserted < 1) {
        element.__inserted = 1;
      }
      // if we are 'over inserted', squelch the callback
      if (element.__inserted > 1) {
        logFlags.dom && console.warn('inserted:', element.localName,
          'insert/remove count:', element.__inserted)
      } else if (element.insertedCallback) {
        logFlags.dom && console.log('inserted:', element.localName);
        element.insertedCallback();
      }
    }
    logFlags.dom && console.groupEnd();
  }
}

function removedNode(node) {
  removed(node);
  forSubtree(node, function(e) {
    removed(e);
  });
}

function removed(element) {
  // TODO(sjmiles): temporary: do work on all custom elements so we can track
  // behavior even when callbacks not defined
  if (element.removedCallback || (element.__upgraded__ && logFlags.dom)) {
    logFlags.dom && console.log('removed:', element.localName);
    if (!inDocument(element)) {
      element.__inserted = (element.__inserted || 0) - 1;
      // if we are in a 'inserted' state, bluntly adjust to an 'removed' state
      if (element.__inserted > 0) {
        element.__inserted = 0;
      }
      // if we are 'over removed', squelch the callback
      if (element.__inserted < 0) {
        logFlags.dom && console.warn('removed:', element.localName,
            'insert/remove count:', element.__inserted)
      } else if (element.removedCallback) {
        element.removedCallback();
      }
    }
  }
}

function inDocument(element) {
  var p = element;
  while (p) {
    if (p == element.ownerDocument) {
      return true;
    }
    p = p.parentNode || p.host;
  }
}

function watchShadow(node) {
  if (node.webkitShadowRoot && !node.webkitShadowRoot.__watched) {
    logFlags.dom && console.log('watching shadow-root for: ', node.localName);
    observe(node.webkitShadowRoot);
    node.webkitShadowRoot.__watched = true;
  }
}

function watchAllShadows(node) {
  watchShadow(node);
  forSubtree(node, function(e) {
    watchShadow(node);
  });
}

function filter(inNode) {
  switch (inNode.localName) {
    case 'style':
    case 'script':
    case 'template':
    case undefined:
      return true;
  }
}

function handler(mutations) {
  //
  if (logFlags.dom) {
    var mx = mutations[0];
    if (mx && mx.type === 'childList' && mx.addedNodes) {
        if (mx.addedNodes) {
          var d = mx.addedNodes[0];
          while (d && d !== document && !d.host) {
            d = d.parentNode;
          }
          var u = d && (d.URL || d._URL || (d.host && d.host.localName)) || '';
          u = u.split('/?').shift().split('/').pop();
        }
    }
    console.group('mutations (%d) [%s]', mutations.length, u || '');
  }
  //
  mutations.forEach(function(mx) {
    //logFlags.dom && console.group('mutation');
    if (mx.type === 'childList') {
      forEach(mx.addedNodes, function(n) {
        //logFlags.dom && console.log(n.localName);
        if (filter(n)) {
          return;
        }
        // watch shadow-roots on nodes that have had them attached manually
        // TODO(sjmiles): remove if createShadowRoot is overridden
        // TODO(sjmiles): removed as an optimization, manual shadow roots
        // must be watched explicitly
        //watchAllShadows(n);
        // nodes added may need lifecycle management
        addedNode(n);
      });
      // removed nodes may need lifecycle management
      forEach(mx.removedNodes, function(n) {
        //logFlags.dom && console.log(n.localName);
        if (filter(n)) {
          return;
        }
        removedNode(n);
      });
    }
    //logFlags.dom && console.groupEnd();
  });
  logFlags.dom && console.groupEnd();
};

var observer = new MutationObserver(handler);

function takeRecords() {
  // TODO(sjmiles): ask Raf why we have to call handler ourselves
  handler(observer.takeRecords());
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

function observe(inRoot) {
  observer.observe(inRoot, {childList: true, subtree: true});
}

function observeDocument(document) {
  observe(document);
}

function upgradeDocument(document) {
  logFlags.dom && console.group('upgradeDocument: ', (document.URL || document._URL || '').split('/').pop());
  addedNode(document);
  logFlags.dom && console.groupEnd();
}

// exports

scope.watchShadow = watchShadow;
scope.watchAllShadows = watchAllShadows;

scope.upgradeAll = addedNode;
scope.upgradeSubtree = addedSubtree;

scope.observeDocument = observeDocument;
scope.upgradeDocument = upgradeDocument;

scope.takeRecords = takeRecords;

})(window.CustomElements);

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(){

var HTMLElementElement = function(inElement) {
  inElement.register = HTMLElementElement.prototype.register;
  parseElementElement(inElement);
  return inElement;
};

HTMLElementElement.prototype = {
  register: function(inMore) {
    if (inMore) {
      this.options.lifecycle = inMore.lifecycle;
      if (inMore.prototype) {
        mixin(this.options.prototype, inMore.prototype);
      }
    }
  }
};

function parseElementElement(inElement) {
  // options to glean from inElement attributes
  var options = {
    name: '',
    extends: null
  };
  // glean them
  takeAttributes(inElement, options);
  // default base
  var base = HTMLElement.prototype;
  // optional specified base
  if (options.extends) {
    // build an instance of options.extends
    var archetype = document.createElement(options.extends);
    // acquire the prototype
    // TODO(sjmiles): __proto__ may be hinted by the custom element
    // system on platforms that don't support native __proto__
    // on those platforms the API is mixed into archetype and the
    // effective base is not archetype's real prototype
    base = archetype.__proto__ || Object.getPrototypeOf(archetype);
  }
  // extend base
  options.prototype = Object.create(base);
  // install options
  inElement.options = options;
  // locate user script
  var script = inElement.querySelector('script:not([type]),script[type="text/javascript"],scripts');
  if (script) {
    // execute user script in 'inElement' context
    executeComponentScript(script.textContent, inElement, options.name);
  };
  // register our new element
  var ctor = document.register(options.name, options);
  inElement.ctor = ctor;
  // store optional constructor reference
  var refName = inElement.getAttribute('constructor');
  if (refName) {
    window[refName] = ctor;
  }
}

// each property in inDictionary takes a value
// from the matching attribute in inElement, if any
function takeAttributes(inElement, inDictionary) {
  for (var n in inDictionary) {
    var a = inElement.attributes[n];
    if (a) {
      inDictionary[n] = a.value;
    }
  }
}

// invoke inScript in inContext scope
function executeComponentScript(inScript, inContext, inName) {
  // set (highlander) context
  context = inContext;
  // source location
  var owner = context.ownerDocument;
  var url = (owner._URL || owner.URL || owner.impl
      && (owner.impl._URL || owner.impl.URL));
  // ensure the component has a unique source map so it can be debugged
  // if the name matches the filename part of the owning document's url,
  // use this, otherwise, add ":<name>" to the document url.
  var match = url.match(/.*\/([^.]*)[.]?.*$/);
  if (match) {
    var name = match[1];
    url += name != inName ? ':' + inName : '';
  }
  // compose script
  var code = "__componentScript('"
    + inName
    + "', function(){"
    + inScript
    + "});"
    + "\n//@ sourceURL=" + url + "\n"
  ;
  // inject script
  eval(code);
}

var context;

// global necessary for script injection
window.__componentScript = function(inName, inFunc) {
  inFunc.call(context);
};

// utility

// copy top level properties from props to obj
function mixin(obj, props) {
  obj = obj || {};
  try {
    Object.getOwnPropertyNames(props).forEach(function(n) {
      var pd = Object.getOwnPropertyDescriptor(props, n);
      if (pd) {
        Object.defineProperty(obj, n, pd);
      }
    });
  } catch(x) {
  }
  return obj;
}

// exports

window.HTMLElementElement = HTMLElementElement;

})();

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function() {

var IMPORT_LINK_TYPE = 'import';

// highlander object for parsing a document tree

var componentParser = {
  selectors: [
    'link[rel=' + IMPORT_LINK_TYPE + ']',
    'link[rel=stylesheet]',
    'script[src]',
    'script:not([type])',
    'script[type="text/javascript"]',
    'style',
    'element'
  ],
  map: {
    link: 'parseLink',
    script: 'parseScript',
    element: 'parseElement',
    style: 'parseStyle'
  },
  parse: function(inDocument) {
    if (!inDocument.__parsed) {
      // only parse once
      inDocument.__parsed = true;
      // all parsable elements in inDocument (depth-first pre-order traversal)
      var elts = inDocument.querySelectorAll(cp.selectors);
      // for each parsable node type, call the mapped parsing method
      forEach(elts, function(e) {
        //console.log(map[e.localName] + ":", path.nodeUrl(e));
        cp[cp.map[e.localName]](e);
      });
      // upgrade all upgradeable static elements, anything dynamically
      // created should be caught by observer
      CustomElements.upgradeDocument(inDocument);
      // observe document for dom changes
      CustomElements.observeDocument(inDocument);
    }
  },
  parseLink: function(inLinkElt) {
    // imports
    if (isDocumentLink(inLinkElt)) {
      if (inLinkElt.content) {
        cp.parse(inLinkElt.content);
      }
    } else if (canAddToMainDoument(inLinkElt)) {
      document.head.appendChild(inLinkElt);
    }
  },
  parseScript: function(inScriptElt) {
    if (canAddToMainDoument(inScriptElt)) {
      // otherwise, evaluate now
      var code = inScriptElt.__resource || inScriptElt.textContent;
      if (code) {
        code += "\n//@ sourceURL=" + inScriptElt.__nodeUrl + "\n";
        eval.call(window, code);
      }
    }
  },
  parseStyle: function(inStyleElt) {
    if (canAddToMainDoument(inStyleElt)) {
      document.head.appendChild(inStyleElt);
    }
  },
  parseElement: function(inElementElt) {
    new HTMLElementElement(inElementElt);
  }
};

var cp = componentParser;

// nodes can be moved to the main document
// if they are not in the main document, are not children of <element>
// and are in a tree at parse time.
function canAddToMainDoument(node) {
  return !inMainDocument(node)
    && node.parentNode
    && !isElementElementChild(node);
}

function inMainDocument(inElt) {
  return inElt.ownerDocument === document ||
    // TODO(sjmiles): ShadowDOMPolyfill intrusion
    inElt.ownerDocument.impl === document;
}

function isDocumentLink(inElt) {
  return (inElt.localName === 'link'
      && inElt.getAttribute('rel') === IMPORT_LINK_TYPE);
}

function isElementElementChild(inElt) {
  if (inElt.parentNode && inElt.parentNode.localName === 'element') {
    return true;
  }
}

var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);

// exports

CustomElements.parser = componentParser;

})();
/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function(){

// bootstrap parsing

// IE shim for CustomEvent
if (typeof window.CustomEvent !== 'function') {
  window.CustomEvent = function(inType) {
     var e = document.createEvent('HTMLEvents');
     e.initEvent(inType, true, true);
     return e;
  };
}

function bootstrap() {
  // go async so call stack can unwind
  setTimeout(function() {
    // parse document
    CustomElements.parser.parse(document);
    // set internal flag
    CustomElements.ready = true;
    CustomElements.readyTime = new Date().getTime();
    if (window.HTMLImports) {
      CustomElements.elapsed = CustomElements.readyTime - HTMLImports.readyTime;
    }
    // notify system
    document.body.dispatchEvent(
      new CustomEvent('WebComponentsReady', {bubbles: true})
    );
  }, 0);
}

// TODO(sjmiles): 'window' has no wrappability under ShadowDOM polyfill, so
// we are forced to split into two versions

if (window.HTMLImports) {
  document.addEventListener('HTMLImportsLoaded', bootstrap);
} else {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    boostrap();
  } else {
    window.addEventListener('DOMContentLoaded', bootstrap);
  }
}

})();

/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function() {

// inject style sheet
var style = document.createElement('style');
style.textContent = 'element {display: none;} /* injected by platform.js */';
var head = document.querySelector('head');
head.insertBefore(style, head.firstChild);

if (window.ShadowDOMPolyfill) {

  function nop() {};

  // disable shadow dom watching
  CustomElements.watchShadow = nop;
  CustomElements.watchAllShadows = nop;

  // ensure wrapped inputs for these functions
  var fns = ['upgradeAll', 'upgradeSubtree', 'observeDocument',
      'upgradeDocument'];

  // cache originals
  var original = {};
  fns.forEach(function(fn) {
    original[fn] = CustomElements[fn];
  });

  // override
  fns.forEach(function(fn) {
    CustomElements[fn] = function(inNode) {
      return original[fn](wrap(inNode));
    };
  });

}

})();

(function () {

/*** Variables ***/

  var win = window,
    doc = document,
    noop = function(){},
    regexPseudoSplit = /([\w-]+(?:\([^\)]+\))?)/g,
    regexPseudoReplace = /(\w*)(?:\(([^\)]*)\))?/,
    regexDigits = /(\d+)/g,
    keypseudo = {
      action: function (pseudo, event) {
        return pseudo.value.match(regexDigits).indexOf(String(event.keyCode)) > -1 == (pseudo.name == 'keypass');
      }
    },
    prefix = (function () {
      var styles = win.getComputedStyle(doc.documentElement, ''),
          pre = (Array.prototype.slice
            .call(styles)
            .join('')
            .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
          )[1];
      return {
        dom: pre == 'ms' ? pre.toUpperCase() : pre,
        lowercase: pre,
        css: '-' + pre + '-',
        js: pre[0].toUpperCase() + pre.substr(1)
      };

    })(),
    matchSelector = Element.prototype.matchesSelector || Element.prototype[prefix.lowercase + 'MatchesSelector'];

/*** Functions ***/

// Utilities

  var typeObj = {};
  function typeOf(obj) {
    return typeObj.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }

  function clone(item, type){
    var fn = clone[type || typeOf(item)];
    return fn ? fn(item) : item;
  }
    clone.object = function(src){
      var obj = {};
      for (var key in src) obj[key] = clone(src[key]);
      return obj;
    };
    clone.array = function(src){
      var i = src.length, array = new Array(i);
      while (i--) array[i] = clone(src[i]);
      return array;
    };

  var unsliceable = ['number', 'boolean', 'string', 'function'];
  function toArray(obj){
    return unsliceable.indexOf(typeOf(obj)) == -1 ?
    Array.prototype.slice.call(obj, 0) :
    [obj];
  }

// DOM
  var str = '';
  function query(element, selector){
    return (selector || str).length ? toArray(element.querySelectorAll(selector)) : [];
  }

  function parseMutations(element, mutations) {
    var diff = { added: [], removed: [] };
    mutations.forEach(function(record){
      record._mutation = true;
      for (var z in diff) {
        var type = element._records[(z == 'added') ? 'inserted' : 'removed'],
          nodes = record[z + 'Nodes'], length = nodes.length;
        for (var i = 0; i < length && diff[z].indexOf(nodes[i]) == -1; i++){
          diff[z].push(nodes[i]);
          type.forEach(function(fn){
            fn(nodes[i], record);
          });
        }
      }
    });
  }

// Mixins

  function mergeOne(source, key, current){
    var type = typeOf(current);
    if (type == 'object' && typeOf(source[key]) == 'object') xtag.merge(source[key], current);
    else source[key] = clone(current, type);
    return source;
  }

  function mergeMixin(type, mixin, option) {
    var original = {};
    for (var o in option) original[o.split(':')[0]] = true;
    for (var x in mixin) if (!original[x.split(':')[0]]) option[x] = mixin[x];
  }

  function applyMixins(tag) {
    tag.mixins.forEach(function (name) {
      var mixin = xtag.mixins[name];
      for (var type in mixin) {
        switch (type) {
          case 'lifecycle': case 'methods':
            mergeMixin(type, mixin[type], tag[type]);
            break;
          case 'accessors': case 'prototype':
            for (var z in mixin[type]) mergeMixin(z, mixin[type], tag.accessors);
            break;
          case 'events':
            break;
        }
      }
    });
    return tag;
  }

// Events

  function touchFilter(custom, event) {
    if (custom.listener.touched) return custom.listener.touched = false;
    else {
      if (event.type.match('touch')) custom.listener.touched = true;
    }
  }

  function createFlowEvent(type) {
    var flow = type == 'over';
    return {
      base: 'OverflowEvent' in win ? 'overflowchanged' : type + 'flow',
      condition: function (custom, event) {
        event.flow = type;
        return event.type == (type + 'flow') ||
        ((event.orient === 0 && event.horizontalOverflow == flow) ||
        (event.orient == 1 && event.verticalOverflow == flow) ||
        (event.orient == 2 && event.horizontalOverflow == flow && event.verticalOverflow == flow));
      }
    };
  }

// Accessors

  function getArgs(attr, value){
    return {
      value: attr.boolean ? '' : value,
      method: attr.boolean && (value === false || value === null) ? 'removeAttribute' : 'setAttribute'
    };
  }

  function setAttr(attr, name, value){
    var args = getArgs(attr, value);
    this[args.method](name, args.value);
  }

  function syncAttr(attr, name, value){
    var args = getArgs(attr, value),
        nodes = attr.property ? [this.xtag[attr.property]] : attr.selector ? xtag.query(this, attr.selector) : [],
        index = nodes.length;
    while (index--) nodes[index][args.method](name, args.value);
  }

  function wrapAttr(tag, method){
    var original = tag.prototype[method] || HTMLElement.prototype[method];
    tag.prototype[method] = {
      writable: true,
      enumberable: true,
      value: function (name, value, skip){
        var attr = tag.attributes[name.toLowerCase()];
        original.call(this, name, attr && attr.boolean ? '' : value);
        if (attr) {
          syncAttr.call(this, attr, name, value);
          if (!attr.skip && !this.xtag._skipAttr) {
            attr.setter.call(this, attr.boolean ? method == 'setAttribute' : this.getAttribute(name));
          }
          delete this.xtag._skipAttr;
        }
      }
    };
  }

  function updateTemplate(element, name, value){
    if (element.template){
      element.xtag.template.updateBindingValue(element, name, value);
    }
  }

  function attachProperties(tag, prop, z, accessor, attr, name){
    var key = z.split(':'), type = key[0];
    if (type == 'get') {
      key[0] = prop;
      tag.prototype[prop].get = xtag.applyPseudos(key.join(':'), accessor[z], tag.pseudos);
    }
    else if (type == 'set') {
      key[0] = prop;
      if (attr) attr.setter = accessor[z];
      tag.prototype[prop].set = xtag.applyPseudos(key.join(':'), attr ? function(value, skip){
        syncAttr.call(this, attr, name, value);
        accessor[z].call(this, value);
        if (!skip && !attr.skip) {
          this.xtag._skipAttr = true;
          setAttr.call(this, attr, name, value);
        }
        updateTemplate(this, name, value);

      } : accessor[z] ? function(value){
        accessor[z].call(this, value);
        updateTemplate(this, name, value);
      } : null, tag.pseudos);
    }
    else tag.prototype[prop][z] = accessor[z];
  }

  function parseAccessor(tag, prop){
    tag.prototype[prop] = {};
    var accessor = tag.accessors[prop],
        attr = accessor.attribute,
        name = attr && attr.name ? attr.name.toLowerCase() : prop;

    if (attr) tag.attributes[name] = attr;
    for (var z in accessor) attachProperties(tag, prop, z, accessor, attr, name);

    if (attr) {
      if (!tag.prototype[prop].get) {
        var method = (attr.boolean ? 'has' : 'get') + 'Attribute';
        tag.prototype[prop].get = function(){
          return this[method](name);
        };
      }
      if (!tag.prototype[prop].set) tag.prototype[prop].set = function(value){
        this.xtag._skipAttr = true;
        setAttr.call(this, attr, name, value);
        updateTemplate(this, name, value);
      };
    }
  }

/*** X-Tag Object Definition ***/

  var xtag = {
    tags: {},
    defaultOptions: {
      pseudos: [],
      mixins: [],
      events: {},
      methods: {},
      accessors: {
        template: {
          attribute: {},
          set: function(value){
            var last = this.getAttribute('template');
            this.xtag.__previousTemplate__ = last;
            xtag.fireEvent(this, 'templatechange', { template: value });
          }
        }
      },
      lifecycle: {},
      attributes: {},
      'prototype': {
        xtag: {
          get: function(){
            return this.__xtag__ ? this.__xtag__ : (this.__xtag__ = { data: {} });
          }
        }
      }
    },
    register: function (name, options) {
      var element, _name;
      if (typeof name == 'string') {
        _name = name.toLowerCase();
      } else if (name.nodeName == 'ELEMENT') {
        element = name;
        _name = element.getAttribute('name').toLowerCase();
      } else {
        return;
      }

      var tag = xtag.tags[_name] = applyMixins(xtag.merge({}, xtag.defaultOptions, options));

      for (var z in tag.events) tag.events[z] = xtag.parseEvent(z, tag.events[z]);
      for (z in tag.lifecycle) tag.lifecycle[z.split(':')[0]] = xtag.applyPseudos(z, tag.lifecycle[z], tag.pseudos);
      for (z in tag.methods) tag.prototype[z.split(':')[0]] = { value: xtag.applyPseudos(z, tag.methods[z], tag.pseudos), enumerable: true };
      for (z in tag.accessors) parseAccessor(tag, z);

      var ready = tag.lifecycle.created || tag.lifecycle.ready;
      tag.prototype.readyCallback = {
        enumerable: true,
        value: function(){
          var element = this;
          var template = element.getAttribute('template');
          if (template){
            xtag.fireEvent(this, 'templatechange', { template: template });
          }
          xtag.addEvents(this, tag.events);
          tag.mixins.forEach(function(mixin){
            if (xtag.mixins[mixin].events) xtag.addEvents(element, xtag.mixins[mixin].events);
          });
          var output = ready ? ready.apply(this, toArray(arguments)) : null;
          for (var name in tag.attributes) {
            var attr = tag.attributes[name],
                hasAttr = this.hasAttribute(name),
                value = attr.boolean ? hasAttr : this.getAttribute(name);
            if (attr.boolean || hasAttr) {
              syncAttr.call(this, attr, name, value);
              if (attr.setter) attr.setter.call(this, value, true);
            }
          }
          tag.pseudos.forEach(function(obj){
            obj.onAdd.call(element, obj);
          });
          return output;
        }
      };

      if (tag.lifecycle.inserted) tag.prototype.insertedCallback = { value: tag.lifecycle.inserted, enumerable: true };
      if (tag.lifecycle.removed) tag.prototype.removedCallback = { value: tag.lifecycle.removed, enumerable: true };
      if (tag.lifecycle.attributeChanged) tag.prototype.attributeChangedCallback = { value: tag.lifecycle.attributeChanged, enumerable: true };

      wrapAttr(tag, 'setAttribute');
      wrapAttr(tag, 'removeAttribute');

      if (element){
        element.register({
          'prototype': Object.create(Object.prototype, tag.prototype)
        });
      } else {
        return doc.register(_name, {
          'extends': options['extends'],
          'prototype': Object.create(Object.create((options['extends'] ?
            document.createElement(options['extends']).constructor :
            win.HTMLElement).prototype, tag.prototype), tag.prototype)
        });
      }
    },

    /* Exposed Variables */

    mixins: {},
    prefix: prefix,
    templates: {},
    captureEvents: ['focus', 'blur'],
    customEvents: {
      overflow: createFlowEvent('over'),
      underflow: createFlowEvent('under'),
      animationstart: {
        base: [
          'animationstart',
          'oAnimationStart',
          'MSAnimationStart',
          'webkitAnimationStart'
        ]
      },
      transitionend: {
        base: [
          'transitionend',
          'oTransitionEnd',
          'MSTransitionEnd',
          'webkitTransitionEnd'
        ]
      },
      tap: {
        base: ['click', 'touchend'],
        condition: touchFilter
      },
      tapstart: {
        base: ['mousedown', 'touchstart'],
        condition: touchFilter
      },
      tapend: {
        base: ['mouseup', 'touchend'],
        condition: touchFilter
      },
      tapenter: {
        base: ['mouseover', 'touchenter'],
        condition: touchFilter
      },
      tapleave: {
        base: ['mouseout', 'touchleave'],
        condition: touchFilter
      },
      tapmove: {
        base: ['mousemove', 'touchmove'],
        condition: touchFilter
      }
    },
    pseudos: {
      keypass: keypseudo,
      keyfail: keypseudo,
      delegate: {
        action: function (pseudo, event) {
          var target = query(this, pseudo.value).filter(function (node) {
            return node == event.target || node.contains ? node.contains(event.target) : false;
          })[0];
          return target ? pseudo.listener = pseudo.listener.bind(target) : false;
        }
      },
      preventable: {
        action: function (pseudo, event) {
          return !event.defaultPrevented;
        }
      }
    },

    /* UTILITIES */

    clone: clone,
    typeOf: typeOf,
    toArray: toArray,

    wrap: function (original, fn) {
      return function(){
        var args = toArray(arguments),
          returned = original.apply(this, args);
        return returned === false ? false : fn.apply(this, typeof returned != 'undefined' ? toArray(returned) : args);
      };
    },

    merge: function(source, k, v){
      if (typeOf(k) == 'string') return mergeOne(source, k, v);
      for (var i = 1, l = arguments.length; i < l; i++){
        var object = arguments[i];
        for (var key in object) mergeOne(source, key, object[key]);
      }
      return source;
    },

    /* DOM */

    query: query,

    skipTransition: function(element, fn, bind){
      var prop = prefix.js + 'TransitionProperty';
      element.style[prop] = element.style.transitionProperty = 'none';
      xtag.requestFrame(function(){
        var callback;
        if (fn) callback = fn.call(bind);
        xtag.requestFrame(function(){
          element.style[prop] = element.style.transitionProperty = '';
          if (callback) xtag.requestFrame(callback);
        });
      });
    },

    requestFrame: (function(){
      var raf = win.requestAnimationFrame ||
        win[prefix.lowercase + 'RequestAnimationFrame'] ||
        function(fn){ return win.setTimeout(fn, 20); };
      return function(fn){
        return raf.call(win, fn);
      };
    })(),

    matchSelector: function (element, selector) {
      return matchSelector.call(element, selector);
    },

    set: function (element, method, value) {
      element[method] = value;
      if (window.CustomElements) CustomElements.upgradeAll(element);
    },

    innerHTML: function(el, html){
      xtag.set(el, 'innerHTML', html);
    },

    hasClass: function (element, klass) {
      return element.className.split(' ').indexOf(klass.trim())>-1;
    },

    addClass: function (element, klass) {
      var list = element.className.trim().split(' ');
      klass.trim().split(' ').forEach(function (name) {
        if (!~list.indexOf(name)) list.push(name);
      });
      element.className = list.join(' ').trim();
      return element;
    },

    removeClass: function (element, klass) {
      var classes = klass.trim().split(' ');
      element.className = element.className.trim().split(' ').filter(function (name) {
        return name && !~classes.indexOf(name);
      }).join(' ');
      return element;
    },

    toggleClass: function (element, klass) {
      return xtag[xtag.hasClass(element, klass) ? 'removeClass' : 'addClass'].call(null, element, klass);

    },

    queryChildren: function (element, selector) {
      var id = element.id,
        guid = element.id = id || 'x_' + new Date().getTime(),
        attr = '#' + guid + ' > ';
      selector = attr + (selector + '').replace(',', ',' + attr, 'g');
      var result = element.parentNode.querySelectorAll(selector);
      if (!id) element.removeAttribute('id');
      return toArray(result);
    },

    createFragment: function(content) {
      var frag = doc.createDocumentFragment();
      if (content) {
        var div = frag.appendChild(doc.createElement('div')),
          nodes = toArray(content.nodeName ? arguments : !(div.innerHTML = content) || div.children),
          length = nodes.length,
          index = 0;
        while (index < length) frag.insertBefore(nodes[index++], div);
        frag.removeChild(div);
      }
      return frag;
    },

    manipulate: function(element, fn){
      var next = element.nextSibling,
        parent = element.parentNode,
        frag = doc.createDocumentFragment(),
        returned = fn.call(frag.appendChild(element), frag) || element;
      if (next) parent.insertBefore(returned, next);
      else parent.appendChild(returned);
    },

    /* PSEUDOS */

    applyPseudos: function(key, fn, element) {
      var listener = fn,
          pseudos = {};
      if (key.match(':')) {
        var split = key.match(regexPseudoSplit),
            i = split.length;
        while (--i) {
          split[i].replace(regexPseudoReplace, function (match, name, value) {
            if (!xtag.pseudos[name]) throw "pseudo not found: " + name + " " + split;
            var pseudo = pseudos[i] = Object.create(xtag.pseudos[name]);
                pseudo.key = key;
                pseudo.name = name;
                pseudo.value = value;
            var last = listener;
            listener = function(){
              var args = toArray(arguments),
                  obj = {
                    key: key,
                    name: name,
                    value: value,
                    listener: last
                  };
              if (pseudo.action && pseudo.action.apply(this, [obj].concat(args)) === false) return false;
              return obj.listener.apply(this, args);
            };
            if (element && pseudo.onAdd) {
              if (element.getAttribute) {
                pseudo.onAdd.call(element, pseudo);
              } else {
                element.push(pseudo);
              }
            }
          });
        }
      }
      for (var z in pseudos) {
        if (pseudos[z].onCompiled) listener = pseudos[z].onCompiled(listener, pseudos[z]);
      }
      return listener;
    },

    removePseudos: function(element, event){
      event._pseudos.forEach(function(obj){
        obj.onRemove.call(element, obj);
      });
    },

  /*** Events ***/

    parseEvent: function(type, fn) {
      var pseudos = type.split(':'),
        key = pseudos.shift(),
        event = xtag.merge({
          base: key,
          pseudos: '',
          _pseudos: [],
          onAdd: noop,
          onRemove: noop,
          condition: noop
        }, xtag.customEvents[key] || {});
      event.type = key + (event.pseudos.length ? ':' + event.pseudos : '') + (pseudos.length ? ':' + pseudos.join(':') : '');
      if (fn) {
        var chained = xtag.applyPseudos(event.type, fn, event._pseudos);
        event.listener = function(){
          var args = toArray(arguments);
          if (event.condition.apply(this, [event].concat(args)) === false) return false;
          return chained.apply(this, args);
        };
      }
      return event;
    },

    addEvent: function (element, type, fn) {
      var event = (typeof fn == 'function') ? xtag.parseEvent(type, fn) : fn;
      event.listener.event = event;
      event._pseudos.forEach(function(obj){
        obj.onAdd.call(element, obj);
      });
      event.onAdd.call(element, event, event.listener);
      toArray(event.base).forEach(function (name) {
        element.addEventListener(name, event.listener, xtag.captureEvents.indexOf(name) > -1);
      });
      return event.listener;
    },

    addEvents: function (element, events) {
      var listeners = {};
      for (var z in events) {
        listeners[z] = xtag.addEvent(element, z, events[z]);
      }
      return listeners;
    },

    removeEvent: function (element, type, fn) {
      var event = fn.event;
      event.onRemove.call(element, event, fn);
      xtag.removePseudos(element, event);
      toArray(event.base).forEach(function (name) {
        element.removeEventListener(name, fn);
      });
    },

    removeEvents: function(element, listeners){
      for (var z in listeners) xtag.removeEvent(element, z, listeners[z]);
    },

    fireEvent: function(element, type, data, options){
      options = options || {};
      var event = doc.createEvent('Event');
      event.initEvent(type, 'bubbles' in options ? options.bubbles : true, 'cancelable' in options ? options.cancelable : true);
      for (var z in data) event[z] = data[z];
      element.dispatchEvent(event);
    },

    addObserver: function(element, type, fn){
      if (!element._records) {
        element._records = { inserted: [], removed: [] };
        if (mutation){
          element._observer = new mutation(function(mutations) {
            parseMutations(element, mutations);
          });
          element._observer.observe(element, {
            subtree: true,
            childList: true,
            attributes: !true,
            characterData: false
          });
        }
        else ['Inserted', 'Removed'].forEach(function(type){
          element.addEventListener('DOMNode' + type, function(event){
            event._mutation = true;
            element._records[type.toLowerCase()].forEach(function(fn){
              fn(event.target, event);
            });
          }, false);
        });
      }
      if (element._records[type].indexOf(fn) == -1) element._records[type].push(fn);
    },

    removeObserver: function(element, type, fn){
      var obj = element._records;
      if (obj && fn){
        obj[type].splice(obj[type].indexOf(fn), 1);
      }
      else{
        obj[type] = [];
      }
    }

  };

  if (typeof define == 'function' && define.amd) define(xtag);
  else win.xtag = xtag;

  doc.addEventListener('WebComponentsReady', function(){
    xtag.fireEvent(doc.body, 'DOMComponentsLoaded');
  });

})();
(function(){

var head = document.querySelector('head');
var anchor = document.createElement('a');
anchor.href = '';
xtag.callbacks = {};

  function request(element, options){
    clearRequest(element);
    var last = element.xtag.request || {};
    element.xtag.request = options;
    var request = element.xtag.request,
      callbackKey = (element.getAttribute('data-callback-key') ||
        'callback') + '=xtag.callbacks.';
    if (xtag.fireEvent(element, 'beforerequest') === false) return false;
    if (last.url && !options.update &&
      last.url.replace(new RegExp('\&?\(' + callbackKey + 'x[0-9]+)'), '') ==
        element.xtag.request.url){
      element.xtag.request = last;
      return false;
    }
    element.setAttribute('src', element.xtag.request.url);
    anchor.href = options.url;
    if (anchor.hostname == window.location.hostname) {
      request = xtag.merge(new XMLHttpRequest(), request);
      request.onreadystatechange = function(){
        element.setAttribute('data-readystate', request.readyState);
        if (request.readyState == 4 && request.status < 400){
          requestCallback(element, request);
        }
      };
      ['error', 'abort', 'load'].forEach(function(type){
        request['on' + type] = function(event){
          event.request = request;
          xtag.fireEvent(element, type, event);
        }
      });
      request.open(request.method , request.url, true);
      request.setRequestHeader('Content-Type',
        'application/x-www-form-urlencoded');
      request.send();
    }
    else {
      var callbackID = request.callbackID = 'x' + new Date().getTime();
      element.setAttribute('data-readystate', request.readyState = 0);
      xtag.callbacks[callbackID] = function(data){
        request.status = 200;
        request.readyState = 4;
        request.responseText = data;
        requestCallback(element, request);
        delete xtag.callbacks[callbackID];
        clearRequest(element);
      }
      request.script = document.createElement('script');
      request.script.type = 'text/javascript';
      request.script.src = options.url = options.url +
        (~options.url.indexOf('?') ? '&' : '?') + callbackKey + callbackID;
      request.script.onerror = function(error){
        element.setAttribute('data-readystate', request.readyState = 4);
        element.setAttribute('data-requeststatus', request.status = 400);
        xtag.fireEvent(element, 'error', error);
      }
      head.appendChild(request.script);
    }
    element.xtag.request = request;
  }

  function requestCallback(element, request){
    if (request != element.xtag.request) return xtag;
    element.setAttribute('data-readystate', request.readyState);
    element.setAttribute('data-requeststatus', request.status);
    xtag.fireEvent(element, 'dataready', { request: request });
    if (element.dataready) element.dataready.call(element, request);
  }

  function clearRequest(element){
    var req = element.xtag.request;
    if (!req) return xtag;
    if (req.script && ~xtag.toArray(head.children).indexOf(req.script)) {
      head.removeChild(req.script);
    }
    else if (req.abort) req.abort();
  }


  xtag.mixins['request'] = {
    lifecycle:{
      created:  function(){
        this.src = this.getAttribute('src');
      }
    },
    accessors:{
      dataready:{
        get: function(){
          return this.xtag.dataready;
        },
        set: function(fn){
          this.xtag.dataready = fn;
        }
      },
      src:{
        set: function(src){
          if (src){
            this.setAttribute('src', src);
            request(this, { url: src, method: 'GET' });
          }
        },
        get: function(){
          return this.getAttribute('src');
        }
      }
    }
  };

})();
