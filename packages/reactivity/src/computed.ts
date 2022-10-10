import { isFunction } from '@vue/shared'
import { ReactiveEffect, trackEffect, triggerEffect } from './effect'

class ComputedRefImpl {
  private effect
  private _dirty = true
  private __v_isReadonly = true
  private __v_isRef = true
  private _value
  private dep = new Set()

  constructor(getters, private setter) {
    this.effect = new ReactiveEffect(getters, () => {
      if (!this._dirty) {
        this._dirty = true
        triggerEffect(this.dep)
      }
    })
  }

  get value() {
    // 搜集依赖
    trackEffect(this.dep)
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}

export function computed(getterOptions) {
  let onlyGetterFn = isFunction(getterOptions)

  let getter
  let setter

  if (onlyGetterFn) {
    getter = getterOptions
    setter = () => {}
  } else {
    getter = getterOptions.get
    setter = getterOptions.set
  }

  return new ComputedRefImpl(getter, setter)
}
