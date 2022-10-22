var VueRuntimeDom = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/runtime-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Fragment: () => Fragment,
    Text: () => Text,
    createRenderer: () => createRenderer,
    h: () => h,
    render: () => render
  });

  // packages/reactivity/src/effect.ts
  var activeEffect = void 0;
  function clearupEffect(effect2) {
    const { deps = [] } = effect2;
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect2);
      }
      effect2.deps = [];
    }
  }
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.parent = null;
      this.active = true;
      this.deps = [];
    }
    run() {
      if (!this.active) {
        return this.fn();
      }
      try {
        this.parent = activeEffect;
        activeEffect = this;
        clearupEffect(this);
        return this.fn();
      } finally {
        activeEffect = this.parent;
      }
    }
    stop() {
      if (this.active) {
        this.active = false;
        clearupEffect(this);
      }
    }
  };
  function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function track(target, type, key) {
    if (!activeEffect)
      return;
    let depsMap = reactiveMap.get(target);
    if (!depsMap) {
      reactiveMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    trackEffect(dep);
  }
  function trackEffect(dep) {
    let shouldTranck = !dep.has(activeEffect);
    if (shouldTranck) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  }
  function trigger(target, type, key, value, oldValue) {
    const depMap = reactiveMap.get(target);
    if (!depMap)
      return;
    const effects = depMap.get(key);
    triggerEffect(effects);
  }
  function triggerEffect(effects) {
    if (!effect)
      return;
    const tempEffects = [...effects];
    tempEffects.forEach((effect2) => {
      if (effect2 !== activeEffect) {
        if (effect2.scheduler) {
          effect2.scheduler();
        } else {
          effect2.run();
        }
      }
    });
  }

  // packages/shared/src/index.ts
  var isObject = (value) => {
    return typeof value === "object" && value !== null;
  };
  var isString = (value) => {
    return typeof value === "string";
  };
  var isArray = Array.isArray;
  var assign = Object.assign;

  // packages/reactivity/src/baseHandler.ts
  var mutableHandlers = {
    get(target, key, recevier) {
      if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      track(target, "get", key);
      let res = Reflect.get(target, key, recevier);
      if (isObject(res)) {
        res = reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, "set", key, value, oldValue);
      }
      return result;
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap2 = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target))
      return;
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    let exisitingProxy = reactiveMap2.get(target);
    if (exisitingProxy) {
      return exisitingProxy;
    }
    const proxy = new Proxy(target, mutableHandlers);
    return proxy;
  }

  // packages/runtime-core/src/scheduler.ts
  var queue = [];
  var isFlushing = false;
  var resolvePromiss = Promise.resolve();
  function queueJob(job) {
    if (!queue.includes(job)) {
      queue.push(job);
    }
    if (!isFlushing) {
      isFlushing = true;
      resolvePromiss.then(() => {
        isFlushing = false;
        let copy = queue.slice(0);
        for (let i = 0; i < copy.length; i++) {
          let job2 = queue[i];
          job2();
        }
        queue.length = 0;
        copy.length = 0;
      });
    }
  }

  // packages/runtime-core/src/sequence.ts
  function getSequence(arr = []) {
    let result = [];
    let preIndex = [];
    for (let i2 = 0; i2 < arr.length; i2++) {
      if (arr[i2] !== 0) {
        let last2 = arr[result[result.length - 1]];
        let current = arr[i2];
        if (current > last2 || last2 === void 0) {
          preIndex[i2] = result[result.length - 1];
          result.push(i2);
        } else {
          let start = 0;
          let end = result.length - 1;
          let middle;
          while (start < end) {
            middle = Math.floor((start + end) / 2);
            if (arr[result[middle]] > current) {
              end = middle;
            } else {
              start = middle + 1;
            }
          }
          if (arr[result[start]] > current) {
            preIndex[i2] = result[start - 1];
            result[start] = i2;
          }
        }
      }
    }
    let i = result.length;
    let last = result[i - 1];
    while (i-- > 0) {
      result[i] = last;
      last = preIndex[last];
    }
    return result;
  }

  // packages/runtime-core/src/vnode.ts
  var Text = Symbol("text");
  var Fragment = Symbol("Fragment");
  function isVnode(value) {
    return Boolean(value == null ? void 0 : value._v_isVnode);
  }
  function isSameVnode(n1, n2) {
    return (n1 == null ? void 0 : n1.type) === (n2 == null ? void 0 : n2.type) && (n1 == null ? void 0 : n1.key) === (n2 == null ? void 0 : n2.key);
  }
  function createVnode(type, props, children = null) {
    let shapeFlag = isString(type) ? 1 /* ELEMENT */ : isObject(type) ? 4 /* STATRFUL_COMPONENT */ : 0;
    const vnode = {
      el: null,
      type,
      props,
      children,
      key: props == null ? void 0 : props["key"],
      shapeFlag,
      _v_isVnode: true
    };
    if (children) {
      let type2 = 0;
      if (isArray(children)) {
        type2 = 16 /* ARRAY_CHILDREN */;
      } else {
        children = String(children);
        type2 = 8 /* TEXT_CHILDREBN */;
      }
      vnode.shapeFlag |= type2;
    }
    return vnode;
  }

  // packages/runtime-core/src/renderer.ts
  function createRenderer(renderOptions2) {
    let {
      inset: hostInset,
      remove: hostRemove,
      setElementText: hostSetElementText,
      setText: hostSetText,
      parentNode: hostParentNode,
      nextSiblint: hostNextSiblint,
      createElement: hostCreateElement,
      createText: hostCreateText,
      patchProp: hostPatchProp
    } = renderOptions2;
    const normalize = (children, i) => {
      if (isString(children[i])) {
        let vnode = createVnode(Text, null, children[i]);
        children[i] = vnode;
        return vnode;
      }
      return children[i];
    };
    const mounthChildren = (children, container) => {
      for (let i = 0; i < children.length; i++) {
        let child = normalize(children, i);
        patch(null, child, container);
      }
    };
    const mountElement = (vnode, container, anchor = null) => {
      const { type, props, children, shapeFlag } = vnode;
      let el = vnode.el = hostCreateElement(type);
      if (props) {
        for (let key in props) {
          hostPatchProp(el, key, null, props[key]);
        }
      }
      if (shapeFlag & 8 /* TEXT_CHILDREBN */) {
        hostSetElementText(el, children);
      } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mounthChildren(children, el);
      }
      hostInset(el, container, anchor);
    };
    const processText = (n1, n2, container) => {
      if (n1 === null) {
        hostInset(n2.el = hostCreateText(n2.children), container);
      } else {
        let el = n2.el = n1.el;
        if (n1.children !== n2.children) {
          hostSetText(el, n2.children);
        }
      }
    };
    const patchProps = (oldProps, newProps, el) => {
      for (let key in newProps) {
        if (newProps[key]) {
          hostPatchProp(el, key, oldProps[key], newProps[key]);
        }
      }
      for (let key in oldProps) {
        if (!newProps[key]) {
          hostPatchProp(el, key, oldProps[key], void 0);
        }
      }
    };
    const unmountChildren = (children) => {
      for (let i = 0; i < children.length; i++) {
        unmount(children[i]);
      }
    };
    const pathKeydChildren = (c1, c2, el) => {
      let i = 0;
      let e1 = c1.length;
      let e2 = c2.length;
      while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = c2[i];
        if (isSameVnode(n1, n2)) {
          patch(n1, n2, el);
        } else {
          break;
        }
        i++;
      }
      while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2];
        if (isSameVnode(n1, n2)) {
          patch(n1, n2, el);
        } else {
          break;
        }
        e1--;
        e2--;
      }
      if (i > e1) {
        if (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          while (i <= e2) {
            patch(null, c2[i], el, anchor);
            i++;
          }
        }
      } else if (i > e2) {
        while (i <= e1) {
          unmount(c1[i]);
          i++;
        }
      }
      let s1 = i;
      let s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (let i2 = s2; i2 <= e2; i2++) {
        keyToNewIndexMap.set(c2[i2].key, i2);
      }
      const toBePacth = e2 - s2 + 1;
      const newIndexToOldIndexMap = new Array(toBePacth).fill(0);
      for (let i2 = s1; i2 <= e1; i2++) {
        const oldChild = c1[i2];
        const flag = keyToNewIndexMap.has(oldChild.key);
        let newIndex = keyToNewIndexMap.get(oldChild.key);
        if (!flag) {
          unmount(oldChild);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i2 + 1;
          patch(oldChild, c2[newIndex], el);
        }
      }
      const increment = getSequence(newIndexToOldIndexMap);
      let j = increment.length - 1;
      for (let i2 = toBePacth - 1; i2 > 0; i2--) {
        let index = i2 + s2;
        let current = c2[index];
        let anchor = index + 1 < c2.length ? c2[index + 1].el : null;
        if (newIndexToOldIndexMap[i2] === 0) {
          patch(null, current, el, anchor);
        } else {
          if (i2 !== increment[j]) {
            hostInset(current.el, el, anchor);
          } else {
            j--;
          }
        }
      }
    };
    const patchChildren = (n1, n2, el) => {
      const c1 = n1 && n1.children;
      const c2 = n2 && n2.children;
      const prevShapeFlag = n1.shapeFlag;
      const shapeFlag = n2.shapeFlag;
      if (shapeFlag & 8 /* TEXT_CHILDREBN */) {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          unmountChildren(c1);
        }
        if (c1 !== c2) {
          hostSetElementText(el, c2);
        }
      } else {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            pathKeydChildren(c1, c2, el);
          } else {
            unmountChildren(c1);
          }
        } else {
          if (prevShapeFlag & 8 /* TEXT_CHILDREBN */) {
            hostSetElementText(el, "");
          }
          if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountElement(n2, el);
          }
        }
      }
    };
    const patchElement = (n1, n2) => {
      let el = n2.el = n1.el;
      let oldProps = n1.props || {};
      let newProps = n2.props || {};
      patchProps(oldProps, newProps, el);
      patchChildren(n1, n2, el);
    };
    const processElement = (n1, n2, container, anchor) => {
      if (n1 === null) {
        mountElement(n2, container, anchor);
      } else {
        patchElement(n1, n2);
      }
    };
    const processFragment = (n1, n2, container) => {
      if (n1 === null) {
        mounthChildren(n2.children, container);
      } else {
        patchChildren(n1, n2, container);
      }
    };
    const mountComponent = (vnode, container, anchor = null) => {
      let { data = () => {
      }, render: render3 } = vnode.type;
      const state = reactive(data());
      const instance = {
        state,
        vnode,
        subTree: null,
        isMounted: false,
        update: null
      };
      const componentUpdate = () => {
        console.log("\u66F4\u65B0");
        if (instance.isMounted) {
          const subTree = render3.call(state);
          patch(null, subTree, container, anchor);
          instance.subTree = subTree;
          instance.isMounted = true;
        } else {
          const subTree = render3.call(state);
          patch(instance.subTree, subTree, container, anchor);
          instance.subTree = subTree;
        }
      };
      const effect2 = new ReactiveEffect(componentUpdate, () => queueJob(instance.update));
      let update = instance.update = effect2.run.bind(effect2);
      update();
    };
    const processComponent = (n1, n2, container, anchor) => {
      if (n1 === null) {
        mountComponent(n2, container, anchor);
      } else {
      }
    };
    const patch = (n1, n2, container, anchor = null) => {
      if (n1 === n2)
        return;
      if (n1 && !isSameVnode(n1, n2)) {
        unmount(n1);
        n1 = null;
      }
      const { type, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container);
          break;
        case Fragment:
          processFragment(n1, n2, container);
          break;
        default:
          if (shapeFlag & 1 /* ELEMENT */) {
            processElement(n1, n2, container, anchor);
          } else if (shapeFlag & 6 /* COMPONENT */) {
            processComponent(n1, n2, container, anchor);
          }
      }
    };
    const unmount = (vnode) => {
      hostRemove(vnode.el);
    };
    const render2 = (vnode, container) => {
      if (vnode === null) {
        if (container._vnode) {
          unmount(container._vnode);
        }
      } else {
        patch(container._vnode || null, vnode, container);
      }
      container._vnode = vnode;
    };
    return {
      render: render2
    };
  }

  // packages/runtime-core/src/h.ts
  function h(type, propsOrChildren, children) {
    let r = arguments.length;
    if (r === 2) {
      if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
        if (isVnode(propsOrChildren)) {
          return createVnode(type, null, [propsOrChildren]);
        }
        return createVnode(type, propsOrChildren);
      } else {
        return createVnode(type, null, propsOrChildren);
      }
    } else {
      if (r === 3 && isVnode(children)) {
        children = [children];
      } else if (r > 3) {
        children = Array.from(arguments).slice(2);
      }
      return createVnode(type, propsOrChildren, children);
    }
  }

  // packages/runtime-dom/src/nodeOps.ts
  var nodeOps = {
    inset(child, parent, anchor = null) {
      parent.insertBefore(child, anchor);
    },
    remove(child) {
      const parentNode = child.parentNode;
      if (parentNode) {
        parentNode.removeChild(child);
      }
    },
    setElementText(el, test) {
      el.textContent = test;
    },
    setText(node, test) {
      node.nodeValue = test;
    },
    querySelector(seletor) {
      return document.querySelector(seletor);
    },
    parentNode(node) {
      return node.parentNode;
    },
    nexSibling(node) {
      return node.nextSibling;
    },
    createElement(tagName) {
      return document.createElement(tagName);
    },
    createText(text) {
      return document.createTextNode(text);
    }
  };

  // packages/runtime-dom/src/modules/attr.ts
  function pathcAttr(el, key, nextValue) {
    if (nextValue) {
      el.setAttribute(key, nextValue);
    } else {
      el.removeAttribute(key);
    }
  }

  // packages/runtime-dom/src/modules/class.ts
  function pathcClass(el, nextValue) {
    if (nextValue === "null") {
      el.removeAttribute("class");
    } else {
      el.className = nextValue;
    }
  }

  // packages/runtime-dom/src/modules/events.ts
  function createInvoker(callback) {
    const invoker = (e) => invoker.value(e);
    invoker.value = callback;
    return invoker;
  }
  function pathcEvents(el, eventName, nextValue) {
    let invokers = el._vei || (el._vei = {});
    let exits = invokers[eventName];
    if (exits && nextValue) {
      exits.value = nextValue;
    } else {
      let event = eventName.slice(2).toLocaleLowerCase();
      if (nextValue) {
        const invoker = invokers[eventName] = createInvoker(nextValue);
        el.addEventListener(event, invoker);
      } else {
        invokers[eventName] = void 0;
      }
    }
  }

  // packages/runtime-dom/src/modules/style.ts
  function pathcStyle(el, prevValue, nextValue = {}) {
    for (let key in nextValue) {
      el.style[key] = nextValue[key];
    }
    if (prevValue) {
      for (let key in prevValue) {
        if (!nextValue[key] == null) {
          el.style[key] = null;
        }
      }
    }
  }

  // packages/runtime-dom/src/pathProp.ts
  function patchProp(el, key, prevValue, nextValue) {
    if (key === "class") {
      pathcClass(el, nextValue);
    } else if (key === "style") {
      pathcStyle(el, prevValue, nextValue);
    } else if (/^on[^a-z]/.test(key)) {
      pathcEvents(el, key, nextValue);
    } else {
      pathcAttr(el, key, nextValue);
    }
  }

  // packages/runtime-dom/src/index.ts
  var renderOptions = assign(nodeOps, { patchProp });
  function render(vnode, container) {
    createRenderer(renderOptions).render(vnode, container);
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=runtime-dom.global.js.map
