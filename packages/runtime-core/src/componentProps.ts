import { reactive } from '@vue/reactivity'
import { hasOwn } from '@vue/shared'

export function initProps(instance, rowProps) {
  const props = {}
  const attrs = {}

  const options = instance.propsOptions || {}

  if (rowProps) {
    for (let key in rowProps) {
      const value = rowProps[key]
      if (hasOwn(options, key)) {
        props[key] = value
      } else {
        attrs[key] = value
      }
    }
  }

  // TODO: 这里props不希望组件内部被更改，但props需要是响应式的
  // 因为后续属性变化，组件得重新渲染，所有这里应该使用 shallowReactive
  instance.props = reactive(props)
  instance.attrs = attrs
}
