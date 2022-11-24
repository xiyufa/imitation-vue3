export let activeEffectScope = undefined
class EffectScope {
  active = true
  parent = undefined
  effects = []
  scope = []

  constructor(detached) {
    if (!detached && activeEffectScope) {
      activeEffectScope.scope.push(this)
    }
  }

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
      for (let i = 0; i < this.scope.length; i++) {
        this.scope[i].stop()
      }
    }
  }
}

export function recordEffectScope(effect) {
  if (activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(effect)
  }
}

export function effectScope(detached = false) {
  return new EffectScope(detached)
}
