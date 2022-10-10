import { isArray } from './../../shared/src/index'
import { isObject } from '@vue/shared'
import { trackEffect, triggerEffect } from './effect'
import { reactive } from './reactive'

function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}

class RefImp {
  private _value
  private dep = new Set()
  private __v_isRef = true
  constructor(private rawValue) {
    this._value = toReactive(this.rawValue)
  }

  get value() {
    trackEffect(this.dep)
    return this._value
  }

  set value(newValue) {
    if (newValue !== this.rawValue) {
      this._value = toReactive(newValue)
      this.rawValue = newValue
      triggerEffect(this.dep)
    }
  }
}

export function ref(value) {
  return new RefImp(value)
}

class ObjectRefImpl {
  constructor(private object, private key) {}

  get value() {
    return this.object[this.key]
  }

  set value(newValue) {
    this.object[this.key] = newValue
  }
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key)
}

export function toRefs(object) {
  const result = isArray(object) ? new Array(object.length) : {}

  for (let key in object) {
    result[key] = toRef(object, key)
  }

  return result
}

export function proxyRefs(object) {
  return new Proxy(object, {
    get(target, key, recivier) {
      const r = Reflect.get(target, key, recivier)
      return r.__v_isRef ? r._value : r
    },
    set(target, key, value, recivier) {
      let oldValue = target[key]
      if (oldValue.__v_isRef) {
        oldValue._value = value
        return true
      } else {
        return Reflect.set(target, key, value, recivier)
      }
    }
  })
}
