import { recordEffectScope } from './effectScope'

export let activeEffect = undefined

function clearupEffect(effect) {
  const { deps = [] } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    effect.deps = []
  }
}

export class ReactiveEffect {
  private parent = null
  private active = true // effect 默认激活
  private deps = []
  constructor(private fn, private scheduler?) {
    recordEffectScope(this)
  }

  run() {
    if (!this.active) {
      return this.fn()
    }
    try {
      this.parent = activeEffect
      activeEffect = this

      clearupEffect(this)

      return this.fn() // 取值操作 获取到当前的effect
    } finally {
      activeEffect = this.parent
    }
  }
  stop() {
    if (this.active) {
      this.active = false
      clearupEffect(this)
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.run()

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

const reactiveMap = new WeakMap() // { target: { key: set() } }
export function track(target, type, key) {
  if (!activeEffect) return
  let depsMap = reactiveMap.get(target)
  if (!depsMap) {
    reactiveMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  trackEffect(dep)
}

export function trackEffect(dep) {
  let shouldTranck = !dep.has(activeEffect)
  if (shouldTranck) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export function trigger(target, type, key, value, oldValue) {
  const depMap = reactiveMap.get(target)
  if (!depMap) return
  const effects = depMap.get(key)
  triggerEffect(effects)
}

export function triggerEffect(effects) {
  if (!effect) return
  const tempEffects = [...effects]
  tempEffects.forEach(effect => {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        // 若用户传入调度函数，则调用
        effect.scheduler()
      } else {
        effect.run()
      }
    }
  })
}
