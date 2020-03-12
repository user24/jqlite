var $$ = function jqueryLite(arg) {
  var displayDefaults = {};

  function hyphenatedToCamelCase(ruleName) {
    // from https://stackoverflow.com/a/6661012
    return ruleName.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
  }

  // Takes a DOM element and adds some methods to it
  // Setters return the element for chaining, getters obviously don't
  function wrapOne(el) {
    if (!el) {
      console.log('bad el', el);
      return;
    }
    el.parent = function parent() {
      return wrapOne(el.parentNode);
    }
    el.hide = function hide() {
      el.style.display = 'none';
      return el;
    };
    el.show = function show() {
      // Figure out what display value this type of element should have (inline/block/inline-block/etc)
      // Initially pinched from jQuery but then modified a bit
      function defaultDisplay(nodeName) {
        if (!displayDefaults[nodeName]) {
          var elem = document.createElement(nodeName);
          document.body.appendChild(elem);
          var display = (elem.currentStyle || window.getComputedStyle(elem))
            .display;
          document.body.removeChild(elem);
          if (display === 'none' || display === '') {
            display = 'block';
          }
          displayDefaults[nodeName] = display;
        }
        return displayDefaults[nodeName];
      }
      // Set it
      el.style.display = defaultDisplay(el.nodeName);
      return el;
    };
    el.css = function css(rules) {
      if (typeof rules === 'string') {
        // treat as getter
        var style = el.style[hyphenatedToCamelCase(rules)];
        if (parseInt(style) == style) {
          return parseInt(style);
        } else {
          return style;
        }
      } else if (typeof rules === 'object') {
        // set props
        Object.keys(rules).forEach(function (rule) {
          el.style[hyphenatedToCamelCase(rule)] = rules[rule];
        });
      }
      return el;
    };
    el.removeClass = function removeClass(className) {
      el.className = el.className.replace(new RegExp('\\b' + className + '\\b', 'gi'), '');
      return el;
    };
    el.addClass = function addClass(className) {
      el.className += className;
      return el;
    };
    el.next = function next() {
      return wrapOne(el.nextSibling);
    };
    el.prev = function prev() {
      return wrapOne(el.previousSibling);
    };
    el.val = function val(newValue) {
      if (newValue) {
        el.value = newValue;
        return el;
      } else {
        return el.value;
      }
    };
    el.$text = function text(newValue) {
      if (el.textContent !== undefined) {
        prop = 'textContent';
      } else {
        prop = 'innerText';
      }
      if (newValue) {
        el[prop] = newValue;
        return el;
      } else {
        return el[prop];
      }
    };
    el.height = function height(newValue) {
      var isWindowOrDocument = (el.constructor === document.constructor || el.constructor === window.constructor);
      if (isWindowOrDocument || !newValue) {
        // Getter
        if (isWindowOrDocument) {
          // Have to do some magic. Via https://gist.github.com/joshcarr/2f861bd37c3d0df40b30
          return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        } else {
          // Assume it's a standard element
          return parseFloat(getComputedStyle(el, null).height.replace("px", ""))
        }
      } else {
        // Setter
        el.style.height = newValue;
        return el;
      }
    };
    el.on = function on(eventName, handler) {
      eventName
        .split(' ')
        .map(function (eventName) {
          return eventName.trim();
        })
        .forEach(function (eventName) {
          if (el.addEventListener) {
            el.addEventListener(eventName, handler);
          } else {
            el.attachEvent('on' + eventName, function () {
              handler.call(el);
            });
          }
        });
      return el;
    };
    el.off = function off(eventName, handler) {
      eventName
        .split(' ')
        .map(function (eventName) {
          return eventName.trim();
        })
        .forEach(function (eventName) {
          if (el.removeEventListener) {
            el.removeEventListener(eventName, handler);
          } else {
            el.detachEvent('on' + eventName, handler);
          }
        });
      return el;
    };
    el.click = function click(handler) {
      return el.on('click', handler);
    };
    el.change = function change(handler) {
      return el.on('change', handler);
    };
    el.attr = function attr(name, val) {
      if (val !== undefined) {
        el.setAttribute(name, val);
        return el;
      } else {
        return el.getAttribute(name);
      }
    };
    el.removeAttr = function removeAttr(name) {
      el.removeAttribute(name);
      return el;
    };
    el.prop = function prop(name, value) {
      el[name] = value;
      return el;
    };
    el.removeProp = function removeProp(name) {
      // try/catch handles cases where IE balks (such as removing a property on window)
      try {
        this[name] = undefined;
        delete this[name];
      } catch (e) { }
      return el;
    };
    el.trigger = function trigger(eventName) {
      if (document.createEvent) {
        var event = document.createEvent('HTMLEvents');
        event.initEvent(eventName, true, false);
        el.dispatchEvent(event);
      } else {
        el.fireEvent('on' + eventName);
      }
      return el;
    };
    el.fadeTo = function fadeTo(fadeDurationUnsupported, targetOpacity, callback) {
      el.show();

      var last = +new Date();
      var tick = function () {
        el.style.opacity = +el.style.opacity + (new Date() - last) / 400;
        last = +new Date();

        if (+el.style.opacity < targetOpacity) {
          (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
        } else if (typeof callback === 'function') {
          callback();
        }
      };

      tick();
      return el;
    };
    el.fadeIn = function (fadeDurationUnsupported, callback) {
      return el.fadeTo(fadeDurationUnsupported, 1, callback);
    };
    el.fadeOut = function (fadeDurationUnsupported, callback) {
      el.hide();
      if (typeof callback === 'function') {
        callback();
      }
      return el;
    };

    return el;
  }

  // Takes a nodelist, turns into proper array, and augments each node with $$ methods
  // also provides $$ methods on the whole array
  function wrapMany(els) {
    // Turn into a real array
    els = Array.prototype.slice.call(els || []);

    // Augment each node with $$ methods
    els = els.map(wrapOne);

    // Add some collection-only methods
    els.$filter = function $filter(selector) {
      function isVisible(el) {
        return el.offsetWidth > 0 || el.offsetHeight > 0;
      }
      var matches = function gatherMatches(el, selector) {
        var match =
          el.matches ||
          el.matchesSelector ||
          el.msMatchesSelector ||
          el.mozMatchesSelector ||
          el.webkitMatchesSelector ||
          el.oMatchesSelector ||
          function () {
            console.error(
              '.$filter: no matchesSelector support in this browser!'
            );
            return false;
          };
        try {
          return match.call(el, selector);
        } catch (e) {
          // mimic jQuery's fakeass :visible selector
          if (selector === ':visible') {
            return isVisible(el);
          } else if (selector === ':not(:visible)') {
            return !isVisible(el);
          } else {
            console.warn('.$filter: Unsupported selector ', selector);
            return false;
          }
        }
      };
      return wrapMany(
        els.filter(function (el) {
          return matches(el, selector);
        })
      );
    };
    els.$each = function $each(fn) {
      els.forEach(function (el, i) {
        fn.call(el, i, el);
      });
      return els;
    };

    // Augment entire array with $$ methods to allow $('.foo').hide() to hide all .foo elements
    // For each supported method;
    Object.keys(wrapOne({})).forEach(function (method) {
      // Apply this method to the whole group
      els[method] = function () {
        // When called, store the original arguments
        var originalArgs = Array.prototype.slice.call(arguments);
        // And then apply those arguments to each element
        // we also wrapMany on the mapped els, to allow further chaining (e.g. $().hide().$each )
        return wrapMany(
          els.map(function (el) {
            return wrapOne(el)[method].apply(undefined, originalArgs);
          })
        );
      };
    });

    return els;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      document.attachEvent('onreadystatechange', function () {
        if (document.readyState !== 'loading') fn();
      });
    }
  }

  var typeofArg = typeof arg;
  // Support $(function)
  if (typeofArg === 'function') {
    ready(arg);
  }

  // Support $([node]) type usage e.g. $(this)
  if (typeofArg === 'object') {
    if (arg.length) {
      return wrapMany(arg);
    } else {
      return wrapOne(arg);
    }
  }

  // Support $(selectors)
  if (typeofArg === 'string') {
    return wrapMany(document.querySelectorAll(arg));
  }

  // Support $(document).ready
  if (arg && arg.constructor === document.constructor) {
    var obj = wrapOne(arg);
    obj.ready = ready;
    return obj;
  }
};


// Support some $. functions
$$.ajax = function ajax(url, opts) {
  if (arguments.length === 1) {
    opts = url;
    url = undefined;
  }
  if (!opts.method) {
    opts.method = "get";
  }

  function reqListener() {
    if (opts.dataType === "json") {
      opts.success(JSON.parse(this.responseText || null));
    } else {
      opts.success(this.responseText);
    }
  }
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open(opts.method, opts.url);
  oReq.send();
};

$$.getJSON = function getJSON(url, data, success) {
  // Handle two-argument signature
  if (typeof data === 'function' && arguments.length === 2) {
    success = data;
    data = undefined;
  }
  // Pass through to our $$.ajax method
  return $$.ajax({
    dataType: "json",
    url: url,
    data: data,
    success: success
  });
};
