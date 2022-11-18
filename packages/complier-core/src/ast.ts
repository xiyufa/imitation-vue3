import { CREATE_TEXT, CREATE_ELEMENT_VNODE } from './runtimeHelpers'

export const enum NodeTypes {
  Root, // 根节点
  ELEMENT, // 元素
  TEXT, //文本
  COMMENT, // 注释
  SIMPLE_EXPRESSION, // 简单表达式 aaa :a='aa'
  INTERPOLATION, //模板表达式 {{ aa }}
  ATTRIBUTE,
  DIRECTIVE,
  COMPOUND_EXORESSION, // 复合表达式 {{aa}}bb
  IF,
  IF_BRANCH,
  FOR,
  TEXT_CALL, // 文本调用
  VNODE_CALL, // 元素调用
  JS_CALL_EXPRESSION, // js调用
  JS_OBJECT_EXPRESSION
}

export function createCallExpression(context, args) {
  let callee = context.helper(CREATE_TEXT)
  return {
    callee,
    type: NodeTypes.JS_CALL_EXPRESSION,
    arguments: args
  }
}

export function createObjectExpression(properties) {
  return {
    type: NodeTypes.JS_OBJECT_EXPRESSION,
    properties
  }
}

export function createVnodeCall(
  context,
  vnodeTag,
  propsExpression,
  childrenNode
) {
  context.helper(CREATE_ELEMENT_VNODE)
  return {
    type: NodeTypes.VNODE_CALL,
    tag: vnodeTag,
    props: propsExpression,
    children: childrenNode
  }
}
