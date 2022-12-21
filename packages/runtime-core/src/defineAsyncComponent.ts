import { ref } from '@vue/reactivity'
import { h } from './h'
import { Fragment } from './vnode'

export function defineAsyncComponent(options) {
  if (typeof options === 'function') {
    options = { loader: options }
  }
  return {
    setup() {
      const loaded = ref(false)
      const error = ref(false)
      const { loader, timeout, errorComponent } = options
      let Comp = null
      loader().then(c => {
        Comp = c
        loaded.value = true
      })

      setTimeout(() => {
        error.value = true
      }, timeout)

      return () => {
        if (loaded.value) {
          return h(Comp)
        } else if (error.value && errorComponent) {
          return h(errorComponent)
        } else {
          return h(Fragment, [])
        }
      }
    }
  }
}
