import { currentInstance, setCurrentInstance } from './component'

export const enum LifecycleHooks {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BRFORE_UPDATE = 'bu',
  UPDATED = 'u'
}

function createHooks(type) {
  return (hook, target = currentInstance) => {
    if (target) {
      const hooks = target[type] || (target[type] = [])
      // 保证调用hook时 instance不错
      const wrappedHook = () => {
        setCurrentInstance(target)
        hook()
        setCurrentInstance(null)
      }

      hooks.push(wrappedHook)
    }
  }
}

// 工厂函数
export const onBeforeMount = createHooks(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHooks(LifecycleHooks.MOUNTED)
export const onBeforeUpdate = createHooks(LifecycleHooks.BRFORE_UPDATE)
export const onUpdated = createHooks(LifecycleHooks.UPDATED)
