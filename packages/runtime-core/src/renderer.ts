import { isString, ShapeFlags } from '@vue/shared'
import { createVnode, Text } from './vnode'

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
    }
  }

  const patch = (n1, n2, container) => {
    if (n1 === n2) return
    if (n1 === null) {
      const { type, shapeFlag } = n2
      // 初次渲染
      // 目前处理元素的初次渲染
      switch (type) {
        case Text:
          processText(n1, n2, container)
          break
        default:
          if (shapeFlag & ShapeFlags.ELEMENT) {
            mountElement(n2, container)
          }
      }
    } else {
      // 更新
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
