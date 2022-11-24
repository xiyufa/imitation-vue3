export let activeEffectScope = undefined

class EffectScope {
  active = true
  parent = undefined
  effects = []

  constructor() {}

  run(fn) {
    if (this.active) {
      try {
        this.parent = activeEffectScope
        activeEffectScope = this

        return fn()
      } finally {
        activeEffectScope = this.parent
      }
    }
  }
  stop() {
    if (this.active) {
      for (let i = 0; i < this.effects.length; i++) {
        this.effects[i].stop()
        this.active = false
      }
    }
  }
}

export function recordEffectScope(effect) {
  if (activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(effect)
  }
}

export function effectScope() {
  return new EffectScope()
}
