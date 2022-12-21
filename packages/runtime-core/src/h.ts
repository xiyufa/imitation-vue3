// h的用法
// h('div')
// h('div', { style: { color: 'red } })
// h('div', { style: { color: 'red } }, hello)
// h('div', hello)
// h('div', null, hello, 'word')
// h('div', null, h('span))
// h('div', null, [h('span)])

import { isArray, isObject } from '@vue/shared'
import { createVnode, isVnode } from './vnode'

export function h(type, propsOrChildren?, children?) {
  let r = arguments.length

  if (r === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        // 虚拟节点包装成数组
        return createVnode(type, null, [propsOrChildren])
      }
      // 属性
      return createVnode(type, propsOrChildren)
    } else {
      // 数组 或 文本
      return createVnode(type, null, propsOrChildren)
    }
  } else {
    if (r === 3 && isVnode(children)) {
      children = [children]
    } else if (r > 3) {
      children = Array.from(arguments).slice(2)
    }
    return createVnode(type, propsOrChildren, children)
  }
}
