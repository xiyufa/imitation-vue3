import { isString, ShapeFlags } from '@vue/shared'
import { createVnode, isSameVnode, Text } from './vnode'

export function createRenderer(renderOptions) {
  let {
    inset: hostInset,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSiblint: hostNextSiblint,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp
  } = renderOptions

  const normalize = child => {
    if (isString(child)) {
      return createVnode(Text, null, child)
    }
    return child
  }

  const mounthChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      let child = normalize(children[i])
      patch(null, child, container)
    }
  }

  const mountElement = (vnode, container) => {
    const { type, props, children, shapeFlag } = vnode
    let el = (vnode.el = hostCreateElement(type))
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREBN) {
      // 文本
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mounthChildren(children, el)
    }

    hostInset(el, container)
  }

  const processText = (n1, n2, container) => {
    if (n1 === null) {
      hostInset((n2.el = hostCreateText(n2.children)), container)
    } else {
      let el = (n2.el = n1.el)
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children)
      }
    }
  }

  const patchProps = (oldProps, newProps, el) => {
    for (let key in newProps) {
      if (newProps[key]) {
        hostPatchProp(el, key, oldProps[key], newProps[key])
      }
    }
    for (let key in oldProps) {
      if (newProps[key] === null) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  const patchChildren = (n1, n2, el) => {
    
  }

  // 复用节点  再比较属性，再比较子节点
  const patchElement = (n1, n2) => {
    let el = (n2.el = n1.el)
    let oldProps = n1.props || {}
    let newProps = n2.props || {}

    // 比较属性
    patchProps(oldProps, newProps, el)
    // 比较子节点
    patchChildren(n1, n2, el)
  }

  const processElement = (n1, n2, container) => {
    if (n1 === null) {
      mountElement(n2, container)
    } else {
      patchElement(n1, n2)
    }
  }

  const patch = (n1, n2, container) => {
    if (n1 === n2) return
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1)
      n1 = null
    }
    const { type, shapeFlag } = n2
    // 初次渲染
    // 目前处理元素的初次渲染
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container)
        }
    }
  }

  const unmount = vnode => {
    hostRemove(vnode.el)
  }

  const render = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      // 既做初始化也更新
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }

  return {
    render
  }
}
