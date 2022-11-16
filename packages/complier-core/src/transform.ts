import { NodeTypes } from './ast'
import { transformExpression } from './transformExpression'

function transformElement() {}

function transformText() {}

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

  for (let i = 0; i < transfroms.length; i++) {
    transfroms[i](node, context) // 在执行时，node可能被删除

    if (!context.currentNode) return
  }
  switch (node.type) {
    case NodeTypes.ELEMENT:
    case NodeTypes.Root:
      for (let i = 0; i < node.children.length; i++) {
        context.parent = node
        traverse(node.children[i], context)
      }
  }
}

export function transform(ast) {
  const context = createTransformContext(ast)

  traverse(ast, context)
}
