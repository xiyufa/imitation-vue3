import { isTeleport } from './components/Teleport'
import {
  isString,
  ShapeFlags,
  isObject,
  isArray,
  isFunction
} from '@vue/shared'

export const Text = Symbol('text')
export const Fragment = Symbol('Fragment')

export function isVnode(value) {
  return Boolean(value?._v_isVnode)
}

// 判断两个虚拟节点是否是相同节点，1. 标签名相同 2.key 相同
export function isSameVnode(n1, n2) {
  return n1?.type === n2?.type && n1?.key === n2?.key
}

// 虚拟节点： 组件，元素，文本
export function createVnode(type, props, children = null, pacthFlag = 0) {
  let shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isTeleport(type)
    ? ShapeFlags.TELEPORT
    : isFunction(type)
    ? ShapeFlags.FUNCTIONAL_COMPONENT
    : isObject(type)
    ? ShapeFlags.STATRFUL_COMPONENT
    : 0
  // 虚拟dom对象
  const vnode = {
    el: null, // 虚拟节点上对应的真实节点
    type,
    props,
    children,
    key: props?.['key'],
    shapeFlag,
    _v_isVnode: true,
    pacthFlag
  }
  if (children) {
    let type = 0
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else if (isObject(children)) {
      // 插槽
      type = ShapeFlags.SLOTS_CHILDREN
    } else if (isString(children)) {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREBN
    }
    vnode.shapeFlag |= type

    if (currentBlock && vnode.pacthFlag > 0) {
      currentBlock.push(vnode)
    }
  }
  return vnode
}

export { createVnode as _createElementVNode }

let currentBlock = null

export function opendBlock() {
  currentBlock = []
}

export function createElementBlock(type, props, children, pacthFlag) {
  setupBlock(createVnode(type, props, children, pacthFlag))
}

export function setupBlock(vnode) {
  vnode.dynamicChildren = currentBlock
  currentBlock = null

  return vnode
}

export function toDisplayString(val) {
  return isString(val)
    ? val
    : val == null
    ? ''
    : isObject(val)
    ? JSON.stringify(val)
    : String(val)
}
