import { createObjectExpression, createVnodeCall, NodeTypes } from './ast'

export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      let vnodeTag = `"${node.tag}"`

      let properties = []
      let props = node.props

      for (let i = 0; i < props.length; i++) {
        properties.push({
          key: props[i].name,
          value: props[i].value.content
        })
      }

      // 创建一个属性表达式
      const propsExpression =
        properties.length > 0 ? createObjectExpression(properties) : null

      let childrenNode = null
      if (node.children.length === 1) {
        childrenNode = node.children[0]
      } else if (node.children.length > 1) {
        childrenNode = node.children
      }

      // createElementVnode
      node.codegenNode = createVnodeCall(
        context,
        vnodeTag,
        propsExpression,
        childrenNode
      )
    }
  }
}
