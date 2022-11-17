import { NodeTypes } from './ast'

export function transformText(node, context) {
  if (node.type === NodeTypes.Root || node.type === NodeTypes.ELEMENT) {
    return () => {}
  }
}
