import { proxyRefs, reactive } from '@vue/reactivity'
import { hasOwn, isFunction, isObject, ShapeFlags } from '@vue/shared'
import { initProps } from './componentProps'
export let currentInstance = null
export const setCurrentInstance = instance => (currentInstance = instance)
export const getCurrentInstance = () => currentInstance

export function createComponentInstance(vnode, parent) {
  const instance = {
    provides: parent ? parent.provides : Object.create(null),
    parent,
    data: null,
    vnode,
    subTree: null,
    isMounted: false,
    update: null,
    propsOptions: vnode.type.props,
    props: {},
    attrs: {},
    proxy: null,
    render: null,
    setupState: {},
    slots: {}
  }

  return instance
}

const publicPropertyMap = {
  $attrs: i => i.attrs,
  $slots: i => i.slots
}

const publicInstanceProxy = {
  get(target, key) {
    const { data, props, setupState } = target
    if (data && hasOwn(data, key)) {
      return data[key]
    } else if (setupState && hasOwn(setupState, key)) {
      return setupState[key]
    } else if (props && hasOwn(props, key)) {
      return props[key]
    }
    let getter = publicPropertyMap[key]

    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value) {
    const { data, props, setupState } = target
    if (data && hasOwn(data, key)) {
      data[key] = value
      return true
    } else if (setupState && hasOwn(setupState, key)) {
      setupState[key] = value
      return true
    } else if (props && hasOwn(props, key)) {
      // 用户操作的属性是代理对象，此处屏蔽了
      // 但是用户任然可以通过instance.props 拿到真实的props
      console.warn(`attempting to mutatte prop ${key as string}`)
      return false
    }
    return true
  }
}

function initSlots(instance, children) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children
  }
}

export function setupComponent(instance) {
  let { props, type, children } = instance.vnode
  let { data, render, setup } = type
  initProps(instance, props)
  initSlots(instance, children)
  instance.proxy = new Proxy(instance, publicInstanceProxy)
  if (data) {
    if (!isFunction(data)) {
      return console.warn('data option must be a function')
    }
    instance.data = reactive(data.call(instance.proxy))
  }
  if (setup) {
    const setupContext = {
      emit: (event, ...arg) => {
        const eventName = `on${event[0].toUpperCase()}${event.slice(1)}`
        const handle = instance.vnode.props[eventName]
        handle && handle(...arg)
      },
      attrs: instance.attrs,
      slots: instance.slots
    }
    setCurrentInstance(instance)
    const setupResult = setup(instance.props, setupContext)
    setCurrentInstance(null)

    if (isFunction(setupResult)) {
      instance.render = setupResult
    } else if (isObject(setupResult)) {
      instance.setupState = proxyRefs(setupResult)
    }
  }
  if (!instance.render) {
    instance.render = render
  }
}
