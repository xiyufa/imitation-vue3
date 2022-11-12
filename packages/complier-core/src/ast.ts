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
  JS_CALL_EXPORESSION // js调用
}
