import { isObject } from '@vue/shared';
import { reactive } from './reactive';
import { track, trigger } from './effect'

export enum ReactiveFlag {
  IS_REACTIVE = '__v_isReactive'
}

export const mutableHandlers = {
  get(target, key, recevier) {
    if (key === ReactiveFlag.IS_REACTIVE) {
      return true
    }
    track(target, 'get', key)
    let res = Reflect.get(target, key, recevier)
    if (isObject(res)) {
      res = reactive(res)
    }
    return res
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      trigger(target, 'set', key, value, oldValue)
    }
    return result
  }
}
