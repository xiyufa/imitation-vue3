import { createRenderer } from '@vue/runtime-core'
import { assign } from '@vue/shared'
import { nodeOps } from './nodeOps'
import { patchProp } from './pathProp'

export { createRenderer, h } from '@vue/runtime-core'

// domApi 属性Api
const renderOptions = assign(nodeOps, { patchProp }) 

export function render(vnode, container) {
  createRenderer(renderOptions).render(vnode, container)
}
