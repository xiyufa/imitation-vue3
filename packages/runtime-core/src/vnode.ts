import { isArray } from './../../shared/src/index'
import { isString, ShapeFlags } from '@vue/shared'

export function isVnode(value) {
  return Boolean(value?._v_isVnode)
}

// 虚拟节点： 组件，元素，文本
export function createVnode(type, prop, children = null) {
  let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
  // 虚拟dom对象
  const vnode = {
    el: null, // 虚拟节点上对应的真实节点
    type,
    prop,
    children,
    key: prop?.['key'],
    shapeFlag,
    _v_isVnode: true
  }
  if (children) {
    let type = 0
    if (isArray(type)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREBN
    }
    vnode.shapeFlag |= type
  }
  return vnode
}
