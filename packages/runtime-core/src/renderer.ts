import { ReactiveEffect } from '@vue/reactivity'
import {
  invokeArrayFns,
  isNumber,
  isString,
  PatchFlags,
  ShapeFlags
} from '@vue/shared'
import { queueJob } from './scheduler'
import { getSequence } from './sequence'
import { createVnode, isSameVnode, Text, Fragment } from './vnode'
import { createComponentInstance, renderComponent, setupComponent } from './component'
import { hasPropsChange, updateProps } from './componentProps'

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

  const normalize = (children, i) => {
    if (isString(children[i]) || isNumber(children[i])) {
      let vnode = createVnode(Text, null, children[i])
      children[i] = vnode
      return vnode
    }
    return children[i]
  }

  const mounthChildren = (children, container, parentComponent) => {
    for (let i = 0; i < children.length; i++) {
      let child = normalize(children, i)
      patch(null, child, container, parentComponent)
    }
  }

  const mountElement = (vnode, container, anchor = null, parentComponent) => {
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
      mounthChildren(children, el, parentComponent)
    }

    hostInset(el, container, anchor)
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
      if (!newProps[key]) {
        hostPatchProp(el, key, oldProps[key], undefined)
      }
    }
  }

  const unmountChildren = children => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  }

  const pathKeydChildren = (c1, c2, el) => {
    let i = 0
    let e1 = c1.length
    let e2 = c2.length

    // sync from start
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      i++
    }

    // sync from end
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      e1--
      e2--
    }

    // 若i>e1  i - e2 之间的节点新增
    if (i > e1) {
      // 有新增
      if (i <= e2) {
        const nextPos = e2 + 1
        // 想知道往那个方向新增
        const anchor = nextPos < c2.length ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], el, anchor)
          i++
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    }
    // 乱序比较
    let s1 = i
    let s2 = i
    const keyToNewIndexMap = new Map()
    for (let i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i)
    }
    // 循环老节点， 若新的里面有则比较，若没有则删除
    const toBePacth = e2 - s2 + 1
    const newIndexToOldIndexMap = new Array(toBePacth).fill(0)
    for (let i = s1; i <= e1; i++) {
      const oldChild = c1[i]
      const flag = keyToNewIndexMap.has(oldChild.key)
      let newIndex = keyToNewIndexMap.get(oldChild.key)
      if (!flag) {
        unmount(oldChild)
      } else {
        newIndexToOldIndexMap[newIndex - s2] = i + 1
        patch(oldChild, c2[newIndex], el)
      }
    }
    const increment = getSequence(newIndexToOldIndexMap)

    let j = increment.length - 1
    // 移动位置
    for (let i = toBePacth - 1; i > 0; i--) {
      let index = i + s2
      let current = c2[index]
      let anchor = index + 1 < c2.length ? c2[index + 1].el : null
      if (newIndexToOldIndexMap[i] === 0) {
        patch(null, current, el, anchor)
      } else {
        if (i !== increment[j]) {
          hostInset(current.el, el, anchor)
        } else {
          j--
        }
      }
    }
  }

  const patchChildren = (n1, n2, el, parentComponent) => {
    const c1 = n1 && n1.children
    const c2 = n2 && n2.children
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag

    if (shapeFlag & ShapeFlags.TEXT_CHILDREBN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1)
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          pathKeydChildren(c1, c2, el)
        } else {
          unmountChildren(c1)
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREBN) {
          hostSetElementText(el, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountElement(n2, el, null, parentComponent)
        }
      }
    }
  }

  const patchBlockChildren = (n1, n2, parentComponent) => {
    for (let i = 0; i < n2.dynamicChildren.length; i++) {
      patchElement(
        n1.dynamicChildren[i],
        n2.dynamicChildren[i],
        parentComponent
      )
    }
  }

  // 复用节点  再比较属性，再比较子节点
  const patchElement = (n1, n2, parentComponent) => {
    let el = (n2.el = n1.el)
    let oldProps = n1.props || {}
    let newProps = n2.props || {}

    // 比较属性
    patchProps(oldProps, newProps, el)
    let { patchFlag } = n2
    if (patchFlag & PatchFlags.CLASS) {
      if (oldProps.class !== newProps.class) {
        hostPatchProp(el, 'class', null, newProps.class)
      }
      // style, 事件...
    }

    // 比较子节点
    if (n2.dynamicChildren) {
      // 靶向更新
      patchBlockChildren(n1, n2, parentComponent)
    } else {
      patchChildren(n1, n2, el, parentComponent)
    }
  }

  const processElement = (n1, n2, container, anchor, parentComponent) => {
    if (n1 === null) {
      mountElement(n2, container, anchor, parentComponent)
    } else {
      patchElement(n1, n2, parentComponent)
    }
  }

  const processFragment = (n1, n2, container, parentComponent) => {
    if (n1 === null) {
      mounthChildren(n2.children, container, parentComponent)
    } else {
      patchChildren(n1, n2, container, parentComponent)
    }
  }

  const updateComponentPreRender = (instance, next) => {
    instance.next = null
    instance.vnode = next
    updateProps(instance.props, next.props)
  }

  const setupComponentEffect = (instance, container, anchor) => {
    const { render, vnode } = instance
    const componentUpdate = () => {
      // 初始化
      if (!instance.isMounted) {
        const { bm, m } = instance
        if (bm) {
          invokeArrayFns(bm)
        }
        const subTree = renderComponent(instance)
        patch(null, subTree, container, anchor, instance)
        if (m) {
          invokeArrayFns(m)
        }
        instance.subTree = subTree
        instance.isMounted = true
      } else {
        // 组件内部更新
        let { next, u, bu } = instance
        if (next) {
          if (bu) {
            invokeArrayFns(bu)
          }
          // 组件更新前，先更新props
          updateComponentPreRender(instance, next)
          if (u) {
            invokeArrayFns(u)
          }
        }
        const subTree = render.call(instance.proxy)
        patch(instance.subTree, subTree, container, anchor, instance)
        instance.subTree = subTree
      }
    }
    const effect = new ReactiveEffect(componentUpdate, () =>
      queueJob(instance.update)
    )
    let update = (instance.update = effect.run.bind(effect))
    update()
  }

  const mountComponent = (vnode, container, anchor = null, parentComponent) => {
    // 1. 创建一个组件实例
    let instance = (vnode.component = createComponentInstance(
      vnode,
      parentComponent
    ))
    // 2. 给实例赋值
    setupComponent(instance)
    // 3. 创建一个effrct
    setupComponentEffect(instance, container, anchor)
  }

  const showUpdateComponent = (n1, n2) => {
    const { props: prevProps, children: prevChildren } = n1
    const { props: nextProps, children: nextChildren } = n2
    if (prevProps === nextProps) return false
    if (prevChildren || nextChildren) return true
    return hasPropsChange(prevProps, nextProps)
  }

  const updateComponent = (n1, n2) => {
    const instance = (n2.component = n1.component) // 对于元素 复用的是节点，而组件则复用实例
    if (showUpdateComponent(n1, n2)) {
      // 将新的虚拟节点挂载到实例的next
      instance.next = n2
      // 统一调用实例上的更新方法
      instance.update()
    }
  }

  const processComponent = (n1, n2, container, anchor, parentComponent) => {
    if (n1 === null) {
      mountComponent(n2, container, anchor, parentComponent)
    } else {
      updateComponent(n1, n2)
    }
  }

  const patch = (n1, n2, container, anchor = null, parentComponent = null) => {
    // bugfix: n1为null n2可能是undefined
    if (n1 == n2) return
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
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container, anchor, parentComponent)
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          type.process(n1, n2, container, anchor, {
            mounthChildren,
            patchChildren,
            move(vnode, container) {
              hostInset(
                vnode.component ? vnode.component.subtree.el : vnode.el,
                container
              )
            }
          })
        }
    }
  }

  const unmount = vnode => {
    if (vnode.type == Fragment) {
      // Fragment 删除的时候，要清空子节点
      return unmountChildren(vnode)
    } else if (vnode.shapeFlag & ShapeFlags.COMPONENT) {
      return unmount(vnode.component.subtree)
    }
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
