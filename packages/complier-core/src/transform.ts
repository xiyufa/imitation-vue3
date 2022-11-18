import { Fragment } from './../../runtime-core/src/vnode'
import {
  CREATE_ELEMENT_BLOCK,
  CREATE_ELEMENT_VNODE,
  OPEN_BLOCK,
  TO_DISPLAY_STRING
} from './runtimeHelpers'
import { createVnodeCall, NodeTypes } from './ast'
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
    removeHelper(name) {
      const count = context.helpers.get(name)
      if (count) {
        const currentCount = count - 1
        if (!currentCount) {
          context.helpers.delete(name)
        } else {
          context.helpers.set(name, currentCount)
        }
      }
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
      break
    case NodeTypes.ELEMENT:
    case NodeTypes.Root:
      for (let i = 0; i < node.children.length; i++) {
        context.parent = node
        traverse(node.children[i], context)
      }
      break
  }

  let i = exitFns.length
  context.currentNode = node
  while (i--) {
    exitFns[i]()
  }
}

function createRootCodegen(ast, context) {
  let { children } = ast

  if (children.length === 1) {
    const child = children[0]
    if (child.type === NodeTypes.ELEMENT && child.codegenNode) {
      ast.codegenNode = child.codegenNode

      context.removeHelper(CREATE_ELEMENT_VNODE)
      context.helper(OPEN_BLOCK)
      context.helper(CREATE_ELEMENT_BLOCK)

      ast.codegenNode.isBlock = true // 只有一个元素，纳闷当前元素是一个block节点
    } else {
      ast.codegenNode = child.codegenNode
    }
  } else {
    ast.codegenNode = createVnodeCall(
      context,
      context.helper(Fragment),
      null,
      children
    )
    context.helper(OPEN_BLOCK)
    context.helper(CREATE_ELEMENT_BLOCK)

    ast.codegenNode.isBlock = true
  }
}

export function transform(ast) {
  const context = createTransformContext(ast)

  traverse(ast, context)

  createRootCodegen(ast, context)

  ast.helpers = [...context.helpers.keys()]

  console.log(ast.helpers);
  
}
