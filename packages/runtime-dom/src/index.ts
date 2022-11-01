import { createRenderer } from '@vue/runtime-core'
import { assign } from '@vue/shared'
import { nodeOps } from './nodeOps'
import { patchProp } from './pathProp'

export * from '@vue/runtime-core'
export * from '@vue/reactivity'

// domApi 属性Api
const renderOptions = assign(nodeOps, { patchProp })

export function render(vnode, container) {
  createRenderer(renderOptions).render(vnode, container)
}
