import { reactive } from '@vue/reactivity';
import { hasOwn, isFunction } from '@vue/shared'
import { initProps } from './componentProps'

export function createComponentInstance(vnode) {
  const instance = {
    data: null,
    vnode,
    subTree: null,
    isMounted: false,
    update: null,
    propsOptions: vnode.type.props,
    props: {},
    attrs: {},
    proxy: null,
    render: null
  }

  return instance
}

const publicPropertyMap = {
  $attrs: i => i.attrs
}

const publicInstanceProxy = {
  get(target, key) {
    const { data, props } = target
    if (data && hasOwn(data, key)) {
      return data[key]
    } else if (props && hasOwn(props, key)) {
      return props[key]
    }
    let getter = publicPropertyMap[key]

    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value) {
    const { data, props } = target
    if (data && hasOwn(data, key)) {
      data[key] = value
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

export function setupComponent(instance) {
  let { props, type } = instance.vnode
  let { data, render } = type
  initProps(instance, props)
  instance.proxy = new Proxy(instance, publicInstanceProxy)
  instance.render = render
  if (data) {
    if (!isFunction(data)) {
      return console.warn('data option must be a function')
    }
    instance.data = reactive(data.call(instance.proxy))
  }
  instance.components = instance
}