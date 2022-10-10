import { isFunction } from './../../shared/src/index'
import { isObject } from '@vue/shared'
import { ReactiveEffect } from './effect'
import { isReactive } from './reactive'

function traversal(value, set = new Set()) {
  if (!isObject(value) || set.has(value)) return value
  set.add(value)
  for (let key in value) {
    traversal(value[key], set)
  }
  return value
}

// source 传入的对象 cb传入的回调
export function watch(source, cb) {
  let getter
  let oldValue
  let cleanup

  if (isReactive(source)) {
    // 将需要监听的内容包装成一个函数
    getter = () => traversal(source)
  } else if (isFunction(source)) {
    getter = source
  }

  const onCleanup = fn => {
    cleanup = fn
  }

  const job = () => {
    if (cleanup) cleanup()
    let newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  // 监听包装函数，执行job
  const effect = new ReactiveEffect(getter, job)
  oldValue = effect.run()
}
