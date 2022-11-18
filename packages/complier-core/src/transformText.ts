import { createCallExpression, NodeTypes } from './ast'

function isText(node) {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
}

export function transformText(node, context) {
  if (node.type === NodeTypes.Root || node.type === NodeTypes.ELEMENT) {
    return () => {
      let currentContainer = null
      let children = node.children
      let hasText = false

      for (let i = 0; i < children.length; i++) {
        let child = children[i]
        hasText = true
        if (isText(child)) {
          for (let j = i + 1; j < children.length; j++) {
            let next = children[j]
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXORESSION,
                  children: [child]
                }
              }
              currentContainer.children.push('+', next)
              children.splice(j, 1)
              j--
            } else {
              currentContainer = null
              break
            }
          }
        }
      }

      if (!hasText || children.length === 1) {
        return
      }

      for (let i = 0; i < children.length; i++) {
        let child = children[i]
        const callArgs = []

        if (isText(child) || child.type === NodeTypes.COMPOUND_EXORESSION) {
          callArgs.push(child)
          if (node.type !== NodeTypes.TEXT) {
            // 动态节点
            callArgs.push(NodeTypes.TEXT) // 用于靶向更新的标识
          }
          
          children[i] = {
            type: NodeTypes.TEXT_CALL,
            content: child,
            codegen: createCallExpression(context, callArgs)
          }
        }
      }
    }
  }
}
