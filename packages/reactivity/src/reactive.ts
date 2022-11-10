import { isObject } from '@vue/shared'
import { ReactiveFlag, mutableHandlers } from './baseHandler'

const reactiveMap = new WeakMap()

export function isReactive(value) {
  return !!(value && value[ReactiveFlag.IS_REACTIVE])
}

// 同一对象，多次代理，返回同一代理
// 代理对象再次被代理，直接返回
export function reactive(target) {
  if (!isObject(target)) return

  if (target[ReactiveFlag.IS_REACTIVE]) {
    return target
  }

  let exisitingProxy = reactiveMap.get(target)
  if (exisitingProxy) {
    return exisitingProxy
  }

  const proxy = new Proxy(target, mutableHandlers)

  return proxy
}

export function shallowReactive() {}
