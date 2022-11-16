import { parse } from './parse'

export function compile(template) {
  // 将模板转成抽象语法数  （就是编译原理）
  const ast = parse(template)

  return ast
  // 对ast语法书进行一些预处理
  // transform(ast)

  // 生成最终代码
  // return generate(ast)
}
