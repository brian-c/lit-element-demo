// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../index.js":[function(require,module,exports) {
var define;
var global = arguments[3];
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (global = global || self, factory(global.BcWebComponents = {}));
})(this, function (exports) {
  'use strict';

  var template = "<div id=\"underlay\"></div><div id=\"content\" role=\"dialog\" tabindex=\"-1\"><slot></slot></div>";
  var css_248z = ":host([transitioning]){pointer-events:none}#underlay{background:var(--dialog-underlay-background,hsla(0,0%,53.3%,.53));bottom:0;left:0;opacity:1;position:fixed;right:0;top:0;transition:opacity var(--dialog-underlay-fade-duration,.2s);z-index:2}:host([transitioning])>#underlay{opacity:0}#content{align-items:center;bottom:0;display:flex;justify-content:center;left:0;overflow:auto;pointer-events:none;position:fixed;right:0;top:0;z-index:3}#content>::slotted(*){pointer-events:auto}";
  var css_248z$1 = "body[data-dialog-open-count]{overflow:hidden;padding-right:var(--dialog-scrollbar-width,0)}";
  const BODY_STYLE_ID = 'dialog-body-styles';

  function injectBodyCss() {
    if (!document.getElementById(BODY_STYLE_ID)) {
      document.head.insertAdjacentHTML('afterBegin', "\n\t\t\t<style id=\"".concat(BODY_STYLE_ID, "\">\n\t\t\t\t").concat(css_248z$1, "\n\t\t\t</style>\n\t\t"));
    }
  }

  function updateScrollbarWidth() {
    const scrollParent = document.createElement('div');
    const scrollChild = document.createElement('div');
    scrollParent.style.overflow = 'scroll';
    scrollParent.append(scrollChild);
    document.body.append(scrollParent);
    const scrollbarWidth = scrollParent.offsetWidth - scrollChild.offsetWidth;
    scrollParent.remove();
    document.documentElement.style.setProperty('--dialog-scrollbar-width', "".concat(scrollbarWidth, "px"));
  }

  function updateOpenDialogCount(open) {
    let openDialogs = parseFloat(document.body.dataset.dialogOpenCount) || 0;
    openDialogs += open ? 1 : -1;

    if (openDialogs === 0) {
      delete document.body.dataset.dialogOpenCount;
    } else {
      document.body.dataset.dialogOpenCount = openDialogs;
    }
  }

  function waitForTransitions(element, setup, delay = 50) {
    return new Promise(resolve => {
      const targets = [element, element.shadowRoot];
      let transitions = [];

      function handleTransitionRun(event) {
        transitions.push(event.propertyName);
      }

      function handleTransitionEnd(event) {
        const index = transitions.indexOf(event.propertyName);

        if (index !== -1) {
          transitions.splice(index, 1);
        }

        if (transitions.length === 0) {
          targets.forEach(target => {
            target.removeEventListener('transitionrun', handleTransitionRun);
            target.removeEventListener('transitionend', handleTransitionEnd);
          });
          resolve();
        }
      }

      targets.forEach(target => {
        target.addEventListener('transitionrun', handleTransitionRun);
        target.addEventListener('transitionend', handleTransitionEnd);
      });
      setup();
      setTimeout(() => {
        if (transitions.length === 0) {
          resolve();
        }
      }, delay);
    });
  }

  const TRANSITIONING = Symbol('TRANSITIONING');
  const BEFORE_SHOW = Symbol('BEFORE_SHOW');
  const SHOW = Symbol('SHOW');
  const AFTER_SHOW = Symbol('AFTER_SHOW');
  const BEFORE_HIDE = Symbol('BEFORE_HIDE');
  const HIDE = Symbol('HIDE');
  const AFTER_HIDE = Symbol('AFTER_HIDE');

  function mixInTransitions(Class) {
    return class extends Class {
      static get observedAttributes() {
        const originalValue = Class.observedAttributes || [];
        return [...originalValue, 'hidden'];
      }

      set hidden(hidden) {
        this[hidden ? 'setAttribute' : 'removeAttribute']('hidden', '');
      }

      get hidden() {
        return this.hasAttribute('hidden');
      }

      set [TRANSITIONING](transitioning) {
        const method = transitioning ? 'setAttribute' : 'removeAttribute';
        this[method]('transitioning', transitioning);
      }

      get [TRANSITIONING]() {
        return this.getAttribute('transitioning');
      }

      connectedCallback() {
        if (super.connectedCallback) {
          super.connectedCallback(...arguments);
        }

        if (this.isConnected && !this.hidden) {
          // Prevent animating from non-transitioning state
          this[TRANSITIONING] = 'in';
          this[SHOW]();
        }
      }

      disconnectedCallback() {
        if (this.isConnected && !this.hidden) {
          this[HIDE]().then(() => {
            if (super.disconnectedCallback) {
              super.disconnectedCallback(...arguments);
            }
          });
        }
      }

      attributeChangedCallback(name) {
        if (this.isConnected) {
          if (name === 'hidden') {
            if (!this.hidden) {
              this[TRANSITIONING] = 'in';
            }

            this[this.hidden ? HIDE : SHOW]();
          }
        }

        if (super.attributeChangedCallback) {
          super.attributeChangedCallback(...arguments);
        }
      }

      [BEFORE_SHOW]() {
        if (super[BEFORE_SHOW]) {
          return super[BEFORE_SHOW](...arguments);
        }
      }

      [AFTER_SHOW]() {
        this[TRANSITIONING] = null;

        if (super[AFTER_SHOW]) {
          return super[AFTER_SHOW](...arguments);
        }
      }

      [SHOW]() {
        this[BEFORE_SHOW]();
        return waitForTransitions(this, () => {
          this[TRANSITIONING] = 'in';

          if (super[SHOW]) {
            super[SHOW]();
          }
        }).then(() => {
          return this[AFTER_SHOW]();
        });
      }

      [BEFORE_HIDE]() {
        this.style.display = 'block';

        if (super[BEFORE_HIDE]) {
          return super[BEFORE_HIDE](...arguments);
        }
      }

      [AFTER_HIDE]() {
        this.style.display = '';
        this[TRANSITIONING] = null;

        if (super[AFTER_HIDE]) {
          return super[AFTER_HIDE](...arguments);
        }
      }

      [HIDE]() {
        this[BEFORE_HIDE]();
        return new Promise(resolve => {
          setTimeout(() => {
            return waitForTransitions(this, () => {
              this[TRANSITIONING] = 'out';

              if (super[HIDE]) {
                return super[HIDE]();
              }
            }).then(() => {
              return Promise.resolve(this[AFTER_HIDE]()).then(resolve);
            });
          });
        });
      }

      remove() {
        const superRemove = super.remove.bind(this, ...arguments);
        return this[HIDE]().then(superRemove);
      }

    };
  }

  class Breadcrumb extends HTMLElement {
    constructor() {
      super(...arguments);
      this.target = null;
      this.attachShadow({
        mode: 'open'
      });
      this.shadowRoot.innerHTML = "\n\t\t\t<style>\n\t\t\t\t:host {\n\t\t\t\t\tdisplay: none;\n\t\t\t\t}\n\t\t\t</style>\n\t\t";
    }

    disconnectedCallback() {
      if (this.target.isConnected) {
        this.target.remove();
      }
    }

  }

  customElements.define('bc-breadcrumb', Breadcrumb);
  const BREADCRUMB = Symbol('BREADCRUMB');
  const IS_MOVING = Symbol('IS_MOVING');
  const MOVE = Symbol('MOVE');

  function reparent(Class, moveIntoPlace) {
    return class extends Class {
      constructor() {
        super(...arguments);
        this[BREADCRUMB] = new Breadcrumb();
        this[BREADCRUMB].target = this;
        this[IS_MOVING] = false;
      }

      connectedCallback() {
        if (!this[IS_MOVING]) {
          if (this.isConnected) {
            this[MOVE]();
          }

          super.connectedCallback && super.connectedCallback(...arguments);
        }
      }

      disconnectedCallback() {
        if (!this[IS_MOVING]) {
          super.disconnectedCallback && super.disconnectedCallback(...arguments);
          this[BREADCRUMB].remove();
        }
      }

      [MOVE]() {
        try {
          this[IS_MOVING] = true;
          this.parentElement.insertBefore(this[BREADCRUMB], this);
          moveIntoPlace(this);
        } catch (error) {
          throw error;
        } finally {
          this[IS_MOVING] = false;
        }
      }

    };
  }

  class Dialog extends HTMLElement {
    constructor() {
      super(...arguments);
      this._dismiss = this.dismiss.bind(this);
      injectBodyCss();
      this.attachShadow({
        mode: 'open'
      });
      this.shadowRoot.innerHTML = "\n\t\t\t<style>".concat(css_248z, "</style>\n\t\t\t").concat(template, "\n\t\t");
      this._underlay = this.shadowRoot.getElementById('underlay');
      this._content = this.shadowRoot.getElementById('content');
    }

    [BEFORE_SHOW]() {
      updateScrollbarWidth();
      updateOpenDialogCount(true);

      this._underlay.addEventListener('click', this._dismiss);

      document.dispatchEvent(new CustomEvent('dialog-show', {
        bubbles: true
      }));
    }

    [AFTER_SHOW]() {
      this._content.focus();
    }

    [BEFORE_HIDE]() {
      this._underlay.removeEventListener('click', this._dismiss);
    }

    [AFTER_HIDE]() {
      updateOpenDialogCount(false);
      document.dispatchEvent(new CustomEvent('dialog-hide', {
        bubbles: true
      }));
    }

    dismiss() {
      this.dispatchEvent(new CustomEvent('dismiss', {
        bubbles: true
      }));
    }

  }

  const EnhancedDialog = reparent(mixInTransitions(Dialog), function (dialog) {
    dialog.ownerDocument.body.append(dialog);
  });
  customElements.define('bc-dialog', EnhancedDialog);
  let connectedDialogs = 0;

  class DialogSafeArea extends HTMLElement {
    constructor() {
      super(...arguments);
      this._handleDialogShow = this._handleDialogChange.bind(this, +1);
      this._handleDialogHide = this._handleDialogChange.bind(this, -1);
    }

    connectedCallback() {
      if (!this.isConnected) {
        return;
      }

      document.addEventListener('dialog-show', this._handleDialogShow);
      document.addEventListener('dialog-hide', this._handleDialogHide);
    }

    disconnectedCallback() {
      document.removeEventListener('dialog-show', this._handleDialogShow);
      document.removeEventListener('dialog-hide', this._handleDialogHide);
    }

    _handleDialogChange(d) {
      connectedDialogs += d;
      this.inert = connectedDialogs !== 0;
    }

  }

  customElements.define('bc-dialog-safe-area', DialogSafeArea);
  var template$1 = "<div id=\"container\"><slot></slot></div>";
  var css_248z$2 = "";

  class Notification extends HTMLElement {
    constructor() {
      super(...arguments);
      this.attachShadow({
        mode: 'open'
      });
      this.shadowRoot.innerHTML = "\n\t\t\t<style>".concat(css_248z$2, "</style>\n\t\t\t").concat(template$1, "\n\t\t");
      this._container = this.shadowRoot.getElementById('container');
    }

    [BEFORE_SHOW]() {
      this.dispatchEvent(new CustomEvent('notification-show', {
        bubbles: true
      }));
    }

    [BEFORE_HIDE]() {
      const {
        width,
        height
      } = this._container.getBoundingClientRect();

      this.style.setProperty('--notification-height', "".concat(height, "px"));
      this._container.style.width = "".concat(width, "px");
      this.dispatchEvent(new CustomEvent('notification-will-hide', {
        bubbles: true
      }));
    }

    [AFTER_HIDE]() {
      this.dispatchEvent(new CustomEvent('notification-hide', {
        bubbles: true
      }));
    }

  }

  const EnhancedNotification = reparent(mixInTransitions(Notification), function (notification) {
    const notificationHost = notification.ownerDocument.querySelector('bc-notification-host');
    notificationHost.append(notification);
  });
  customElements.define('bc-notification', EnhancedNotification);
  var template$2 = "<div id=\"container\"><slot></slot></div>";
  var css_248z$3 = "#container{position:fixed;right:0;top:0;max-width:var(--max-notification-width,50%);transition:width var(--notification-width-transition-duration,.3s)}"; // import AutoMover from "../helpers/auto-mover";

  class NotificationHost extends HTMLElement {
    static get destination() {
      return document.body;
    }

    constructor() {
      super(...arguments);
      this._updateWidth = this._updateWidth.bind(this);
      this.attachShadow({
        mode: 'open'
      });
      this.shadowRoot.innerHTML = "\n\t\t\t<style>".concat(css_248z$3, "</style>\n\t\t\t").concat(template$2, "\n\t\t");
      this._container = this.shadowRoot.getElementById('container');
    }

    connectedCallback() {
      if (!this.isConnected) {
        return;
      }

      if (this.isAutoMoving) {
        return;
      }

      this.setAttribute('aria-live', true); // Collect any notifications that've connected before the host.

      const notifications = document.querySelectorAll('bc-notification');
      notifications.forEach(notification => notification.move());
      this.addEventListener('resize', this._updateWidth);
      this.addEventListener('notification-show', this._updateWidth);
      this.addEventListener('notification-will-hide', this._updateWidth);
    }

    disconnectedCallback() {
      if (this.isAutoMoving) {
        return;
      }

      this.removeEventListener('resize', this._updateWidth);
      this.removeEventListener('notification-show', this._updateWidth);
      this.removeEventListener('notification-will-hide', this._updateWidth);
    }

    _getWidthWithoutOutgoingNotifications() {
      const originalWidth = this._container.style.width;
      this._container.style.width = '';
      const outgoingNotifications = this.querySelectorAll('[style*="--notification-height"]');
      outgoingNotifications.forEach(notification => {
        notification.style.display = 'none';
      });

      const eventualWidth = this._container.getBoundingClientRect().width;

      this._container.style.width = originalWidth;
      outgoingNotifications.forEach(notification => {
        notification.style.display = '';
      });
      return eventualWidth;
    }

    _updateWidth() {
      const newWidth = this._getWidthWithoutOutgoingNotifications();

      setTimeout(() => {
        this._container.style.width = "".concat(newWidth, "px");
      });
    }

  }

  const EnhancedNotificationHost = reparent(NotificationHost, function (notificationHost) {
    const document = notificationHost.ownerDocument;
    document.body.append(notificationHost);
  });
  customElements.define('bc-notification-host', EnhancedNotificationHost);

  class SwipeObserver {
    constructor(element, changeHandler) {
      this.element = element;
      this.changeHandler = changeHandler;
      this.swipeTouch = null;
      this.element.addEventListener('touchstart', this);
    }

    handleEvent(event) {
      const handler = this["".concat(event.type, "Handler")];

      if (handler !== undefined) {
        handler.apply(this, arguments);
      }
    }

    touchstartHandler(event) {
      if (event.touches.length === 1) {
        this.swipeTouch = event.touches[0];
        window.addEventListener('touchmove', this);
        window.addEventListener('touchend', this);
      }
    }

    touchmoveHandler(event) {
      const touches = [...event.changedTouches];
      const movedTouch = touches.find(t => t.identifier === this.swipeTouch.identifier);

      if (movedTouch) {
        this.callChangeHandler(event, movedTouch, false);
      }
    }

    touchendHandler(event) {
      const touches = [...event.changedTouches];
      const endedTouch = touches.find(t => t.identifier === this.swipeTouch.identifier);

      if (endedTouch) {
        try {
          this.callChangeHandler(event, endedTouch, true);
        } finally {
          window.removeEventListener('touchmove', this);
          window.removeEventListener('touchend', this);
          this.swipeTouch = null;
        }
      }
    }

    callChangeHandler(event, touch, done) {
      this.changeHandler({
        dx: this.swipeTouch.pageX - touch.pageX,
        dy: this.swipeTouch.pageY - touch.pageY,
        done
      }, event);
    }

    destroy() {
      this.element.removeEventListener('touchstart', this);
    }

  }

  var template$3 = "<div id=\"width-comparator\"></div><div id=\"sidebar\"><slot name=\"sidebar\"></slot></div><div id=\"underlay\" style=\"display: none;\"></div><div id=\"content\"><slot></slot></div>";
  var css_248z$4 = ":host{--sidebar-max-width:33%;--sidebar-overlapped-max-width:85%;--sidebar-swipe-threshold:0.5;--sidebar-transition-duration:0.5s}:host([swiping]){--sidebar-swipe-progress-opacity:calc((1 - var(--sidebar-swipe-progress, 0))*1/(1 - var(--sidebar-swipe-threshold)))}#width-comparator{height:1px;pointer-events:none;width:var(--sidebar-max-width)}#sidebar,#width-comparator{left:0;position:fixed;top:0}#sidebar{bottom:0;display:flex;max-width:var(--sidebar-overlapped-max-width);-webkit-overflow-scrolling:touch;transform:translateX(-100%);transition:opacity var(--sidebar-transition-duration),transform var(--sidebar-transition-duration);z-index:2}#sidebar>::slotted(*){overflow:auto}:host([overlapping])>#sidebar{max-width:var(--sidebar-overlapped-max-width)}:host([open])>#sidebar{transform:translateX(calc(-100%*var(--sidebar-swipe-progress, 0)));opacity:var(--sidebar-swipe-progress-opacity)}:host([swiping])>#sidebar{transition:none}#underlay{background:var(--sidebar-underlay-background,hsla(0,0%,53.3%,.2));bottom:0;left:0;opacity:0;position:fixed;right:0;top:0;transform:translateX(-100%);transition:opacity var(--sidebar-transition-duration),transform 0s linear var(--sidebar-transition-duration);z-index:1}:host([open])>#underlay{opacity:var(--sidebar-swipe-progress-opacity);transform:translateX(0);transition:opacity var(--sidebar-transition-duration),transform .01ms}:host([swiping])>#underlay{transition:none}#content{transition:margin-left var(--sidebar-transition-duration)}:host([open]:not([overlapping]))>#content{margin-left:calc(var(--sidebar-actual-width)*(1 - var(--sidebar-swipe-progress, 0)))}:host([swiping])>#content{transition:none}";
  const RESIZE_DEBOUNCE = 15;

  class SidebarLayout extends HTMLElement {
    static get observedAttributes() {
      return ['open', 'overlapping', 'swiping'];
    }

    set open(value) {
      this[value ? 'setAttribute' : 'removeAttribute']('open', '');
    }

    get open() {
      return this.hasAttribute('open');
    }

    set overlapping(value) {
      this[value ? 'setAttribute' : 'removeAttribute']('overlapping', '');
    }

    get overlapping() {
      return this.hasAttribute('overlapping');
    }

    set swiping(value) {
      this[value ? 'setAttribute' : 'removeAttribute']('swiping', '');
    }

    get swiping() {
      return this.hasAttribute('swiping');
    }

    constructor() {
      super(...arguments);
      this._handleResize = this._handleResize.bind(this);
      this._handleSwipe = this._handleSwipe.bind(this);
      this._toggle = this.toggle.bind(this);
      this._resizeTimeout = NaN;
      this.attachShadow({
        mode: 'open'
      });
      this.shadowRoot.innerHTML = "\n\t\t\t<style>".concat(css_248z$4, "</style>\n\t\t\t").concat(template$3, "\n\t\t");
      this._widthComparator = this.shadowRoot.getElementById('width-comparator');
      this._underlay = this.shadowRoot.getElementById('underlay');
      this._sidebar = this.shadowRoot.getElementById('sidebar');
      this._content = this.shadowRoot.getElementById('content');
    }

    connectedCallback() {
      if (!this.isConnected) {
        return;
      }

      addEventListener('resize', this._handleResize);
      this._swipeObserver = new SwipeObserver(this._sidebar, this._handleSwipe);

      this._underlay.addEventListener('click', this._toggle);

      this._handleResize();
    }

    disconnectedCallback() {
      removeEventListener('resize', this._handleResize);

      this._swipeObserver.destroy();

      this._underlay.removeEventListener('click', this._toggle);
    }

    attributeChangedCallback(name) {
      if (name === 'open' || name === 'overlapping') {
        this._content.inert = this.open && this.overlapping;
      }

      if (name === 'open') {
        this._handleResize();

        this._sidebar.inert = !this.open;
        this.dispatchEvent(new CustomEvent('toggle', {
          bubbles: true
        }));
      }

      if (name === 'overlapping') {
        this._underlay.style.display = this.overlapping ? '' : 'none';
      }
    }

    _handleResize() {
      clearTimeout(this._resizeTimeout);
      this._resizeTimeout = setTimeout(() => {
        this.overlapping = this._widthComparator.offsetWidth < this._sidebar.offsetWidth;
        this.style.setProperty('--sidebar-actual-width', "".concat(this._sidebar.offsetWidth, "px"));
      }, RESIZE_DEBOUNCE);
    }

    _handleSwipe({
      dx,
      done
    }, event) {
      const swipeAmount = Math.max(0, dx) / this._sidebar.offsetWidth;

      if (!done) {
        this.swiping = true;
        this.style.setProperty('--sidebar-swipe-progress', swipeAmount);
        event.preventDefault();
      } else {
        const computedStyle = getComputedStyle(this);
        const thresholdValue = computedStyle.getPropertyValue('--sidebar-swipe-threshold');
        const swipeThreshold = parseFloat(thresholdValue);

        if (swipeAmount > swipeThreshold) {
          this.open = false;
        }

        this.swiping = false;
        this.style.removeProperty('--sidebar-swipe-progress');
      }
    }

    toggle() {
      this.open = !this.open;
    }

  }

  customElements.define('bc-sidebar-layout', SidebarLayout);
  exports.Dialog = EnhancedDialog;
  exports.DialogSafeArea = DialogSafeArea;
  exports.Notification = EnhancedNotification;
  exports.NotificationHost = EnhancedNotificationHost;
  exports.SidebarLayout = SidebarLayout;
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
});
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55607" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","../index.js"], null)
//# sourceMappingURL=/web-components.80dfb952.js.map