import { NodeTypes } from './ast'

export function transformExpression(node, context) {
  if (node.type === NodeTypes.INTERPOLATION) {
    let content = node.content.content
    node.content.content = `_ctx.${content}`
  }
}
