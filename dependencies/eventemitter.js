!(function(e) {
  function t() {
    (this._events = {}), this._conf && i.call(this, this._conf);
  }
  function i(e) {
    e &&
      ((this._conf = e),
      e.delimiter && (this.delimiter = e.delimiter),
      e.maxListeners && (this._events.maxListeners = e.maxListeners),
      e.wildcard && (this.wildcard = e.wildcard),
      e.newListener && (this.newListener = e.newListener),
      this.wildcard && (this.listenerTree = {}));
  }
  function s(e) {
    (this._events = {}), (this.newListener = !1), i.call(this, e);
  }
  function n(e, t, i, s) {
    if (!i) return [];
    var r,
      l,
      o,
      h,
      a,
      f,
      c,
      _ = [],
      p = t.length,
      u = t[s],
      v = t[s + 1];
    if (s === p && i._listeners) {
      if ("function" == typeof i._listeners)
        return e && e.push(i._listeners), [i];
      for (r = 0, l = i._listeners.length; r < l; r++)
        e && e.push(i._listeners[r]);
      return [i];
    }
    if ("*" === u || "**" === u || i[u]) {
      if ("*" === u) {
        for (o in i)
          "_listeners" !== o &&
            i.hasOwnProperty(o) &&
            (_ = _.concat(n(e, t, i[o], s + 1)));
        return _;
      }
      if ("**" === u) {
        (c = s + 1 === p || (s + 2 === p && "*" === v)) &&
          i._listeners &&
          (_ = _.concat(n(e, t, i, p)));
        for (o in i)
          "_listeners" !== o &&
            i.hasOwnProperty(o) &&
            ("*" === o || "**" === o
              ? (i[o]._listeners && !c && (_ = _.concat(n(e, t, i[o], p))),
                (_ = _.concat(n(e, t, i[o], s))))
              : (_ =
                  o === v
                    ? _.concat(n(e, t, i[o], s + 2))
                    : _.concat(n(e, t, i[o], s))));
        return _;
      }
      _ = _.concat(n(e, t, i[u], s + 1));
    }
    if (((h = i["*"]) && n(e, t, h, s + 1), (a = i["**"])))
      if (s < p) {
        a._listeners && n(e, t, a, p);
        for (o in a)
          "_listeners" !== o &&
            a.hasOwnProperty(o) &&
            (o === v
              ? n(e, t, a[o], s + 2)
              : o === u
              ? n(e, t, a[o], s + 1)
              : (((f = {})[o] = a[o]), n(e, t, { "**": f }, s + 1)));
      } else
        a._listeners
          ? n(e, t, a, p)
          : a["*"] && a["*"]._listeners && n(e, t, a["*"], p);
    return _;
  }
  function r(e, t) {
    for (
      var i = 0,
        s = (e = "string" == typeof e ? e.split(this.delimiter) : e.slice())
          .length;
      i + 1 < s;
      i++
    )
      if ("**" === e[i] && "**" === e[i + 1]) return;
    for (var n = this.listenerTree, r = e.shift(); r; ) {
      if ((n[r] || (n[r] = {}), (n = n[r]), 0 === e.length)) {
        if (n._listeners) {
          if ("function" == typeof n._listeners)
            n._listeners = [n._listeners, t];
          else if (
            l(n._listeners) &&
            (n._listeners.push(t), !n._listeners.warned)
          ) {
            var h = o;
            void 0 !== this._events.maxListeners &&
              (h = this._events.maxListeners),
              h > 0 &&
                n._listeners.length > h &&
                ((n._listeners.warned = !0),
                console.error(
                  "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",
                  n._listeners.length
                ),
                console.trace());
          }
        } else n._listeners = t;
        return !0;
      }
      r = e.shift();
    }
    return !0;
  }
  var l = Array.isArray
      ? Array.isArray
      : function(e) {
          return "[object Array]" === Object.prototype.toString.call(e);
        },
    o = 10;
  (s.prototype.delimiter = "."),
    (s.prototype.setMaxListeners = function(e) {
      this._events || t.call(this),
        (this._events.maxListeners = e),
        this._conf || (this._conf = {}),
        (this._conf.maxListeners = e);
    }),
    (s.prototype.event = ""),
    (s.prototype.once = function(e, t) {
      return this.many(e, 1, t), this;
    }),
    (s.prototype.many = function(e, t, i) {
      function s() {
        0 == --t && n.off(e, s), i.apply(this, arguments);
      }
      var n = this;
      if ("function" != typeof i)
        throw new Error("many only accepts instances of Function");
      return (s._origin = i), this.on(e, s), n;
    }),
    (s.prototype.emit = function() {
      this._events || t.call(this);
      var e = arguments[0];
      if ("newListener" === e && !this.newListener && !this._events.newListener)
        return !1;
      if (this._all) {
        for (var i = arguments.length, s = new Array(i - 1), r = 1; r < i; r++)
          s[r - 1] = arguments[r];
        for (r = 0, i = this._all.length; r < i; r++)
          (this.event = e), this._all[r].apply(this, s);
      }
      if (
        "error" === e &&
        !(
          this._all ||
          this._events.error ||
          (this.wildcard && this.listenerTree.error)
        )
      )
        throw arguments[1] instanceof Error
          ? arguments[1]
          : new Error("Uncaught, unspecified 'error' event.");
      var l;
      if (this.wildcard) {
        l = [];
        var o = "string" == typeof e ? e.split(this.delimiter) : e.slice();
        n.call(this, l, o, this.listenerTree, 0);
      } else l = this._events[e];
      if ("function" == typeof l) {
        if (((this.event = e), 1 === arguments.length)) l.call(this);
        else if (arguments.length > 1)
          switch (arguments.length) {
            case 2:
              l.call(this, arguments[1]);
              break;
            case 3:
              l.call(this, arguments[1], arguments[2]);
              break;
            default:
              for (
                var i = arguments.length, s = new Array(i - 1), r = 1;
                r < i;
                r++
              )
                s[r - 1] = arguments[r];
              l.apply(this, s);
          }
        return !0;
      }
      if (l) {
        for (var i = arguments.length, s = new Array(i - 1), r = 1; r < i; r++)
          s[r - 1] = arguments[r];
        for (var h = l.slice(), r = 0, i = h.length; r < i; r++)
          (this.event = e), h[r].apply(this, s);
        return h.length > 0 || !!this._all;
      }
      return !!this._all;
    }),
    (s.prototype.on = function(e, i) {
      if ("function" == typeof e) return this.onAny(e), this;
      if ("function" != typeof i)
        throw new Error("on only accepts instances of Function");
      if (
        (this._events || t.call(this),
        this.emit("newListener", e, i),
        this.wildcard)
      )
        return r.call(this, e, i), this;
      if (this._events[e]) {
        if ("function" == typeof this._events[e])
          this._events[e] = [this._events[e], i];
        else if (
          l(this._events[e]) &&
          (this._events[e].push(i), !this._events[e].warned)
        ) {
          var s = o;
          void 0 !== this._events.maxListeners &&
            (s = this._events.maxListeners),
            s > 0 &&
              this._events[e].length > s &&
              ((this._events[e].warned = !0),
              console.error(
                "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",
                this._events[e].length
              ),
              console.trace());
        }
      } else this._events[e] = i;
      return this;
    }),
    (s.prototype.onAny = function(e) {
      if ("function" != typeof e)
        throw new Error("onAny only accepts instances of Function");
      return this._all || (this._all = []), this._all.push(e), this;
    }),
    (s.prototype.addListener = s.prototype.on),
    (s.prototype.off = function(e, t) {
      if ("function" != typeof t)
        throw new Error("removeListener only takes instances of Function");
      var i,
        s = [];
      if (this.wildcard) {
        var r = "string" == typeof e ? e.split(this.delimiter) : e.slice();
        s = n.call(this, null, r, this.listenerTree, 0);
      } else {
        if (!this._events[e]) return this;
        (i = this._events[e]), s.push({ _listeners: i });
      }
      for (var o = 0; o < s.length; o++) {
        var h = s[o];
        if (((i = h._listeners), l(i))) {
          for (var a = -1, f = 0, c = i.length; f < c; f++)
            if (
              i[f] === t ||
              (i[f].listener && i[f].listener === t) ||
              (i[f]._origin && i[f]._origin === t)
            ) {
              a = f;
              break;
            }
          if (a < 0) continue;
          return (
            this.wildcard
              ? h._listeners.splice(a, 1)
              : this._events[e].splice(a, 1),
            0 === i.length &&
              (this.wildcard ? delete h._listeners : delete this._events[e]),
            this
          );
        }
        (i === t ||
          (i.listener && i.listener === t) ||
          (i._origin && i._origin === t)) &&
          (this.wildcard ? delete h._listeners : delete this._events[e]);
      }
      return this;
    }),
    (s.prototype.offAny = function(e) {
      var t,
        i = 0,
        s = 0;
      if (e && this._all && this._all.length > 0) {
        for (i = 0, s = (t = this._all).length; i < s; i++)
          if (e === t[i]) return t.splice(i, 1), this;
      } else this._all = [];
      return this;
    }),
    (s.prototype.removeListener = s.prototype.off),
    (s.prototype.removeAllListeners = function(e) {
      if (0 === arguments.length) return !this._events || t.call(this), this;
      if (this.wildcard)
        for (
          var i = "string" == typeof e ? e.split(this.delimiter) : e.slice(),
            s = n.call(this, null, i, this.listenerTree, 0),
            r = 0;
          r < s.length;
          r++
        )
          s[r]._listeners = null;
      else {
        if (!this._events[e]) return this;
        this._events[e] = null;
      }
      return this;
    }),
    (s.prototype.listeners = function(e) {
      if (this.wildcard) {
        var i = [],
          s = "string" == typeof e ? e.split(this.delimiter) : e.slice();
        return n.call(this, i, s, this.listenerTree, 0), i;
      }
      return (
        this._events || t.call(this),
        this._events[e] || (this._events[e] = []),
        l(this._events[e]) || (this._events[e] = [this._events[e]]),
        this._events[e]
      );
    }),
    (s.prototype.listenersAny = function() {
      return this._all ? this._all : [];
    }),
    "function" == typeof define && define.amd
      ? define(function() {
          return s;
        })
      : "object" == typeof exports
      ? (exports.EventEmitter2 = s)
      : (window.EventEmitter2 = s);
})();
