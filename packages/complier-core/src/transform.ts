import { TO_DISPLAY_STRING } from './runtimeHelpers'
import { NodeTypes } from './ast'
import { transformExpression } from './transformExpression'
import { transformText } from './transformText'
import { transformElement } from './transformElement'

function createTransformContext(root) {
  const context = {
    currentNode: root, // 当前正在转化的节点
    parent: null, // 当前转化节点的父节点
    helpers: new Map(),
    helper(name) {
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
      return name
    },
    nodeTransFroms: [transformElement, transformText, transformExpression]
  }

  return context
}

function traverse(node, context) {
  context.currentNode = node
  const transfroms = context.nodeTransFroms

  let exitFns = []
  for (let i = 0; i < transfroms.length; i++) {
    let onExit = transfroms[i](node, context) // 在执行时，node可能被删除
    if (onExit) {
      exitFns.push(onExit)
    }

    if (!context.currentNode) return
  }
  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
    case NodeTypes.ELEMENT:
    case NodeTypes.Root:
      for (let i = 0; i < node.children.length; i++) {
        context.parent = node
        traverse(node.children[i], context)
      }
  }

  let i = exitFns.length
  context.currentNode = node
  while (i--) {
    exitFns[i]()
  }
}

export function transform(ast) {
  const context = createTransformContext(ast)

  traverse(ast, context)
}
