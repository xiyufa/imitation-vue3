function createGenerate(ast) {
  const context = {
    code: '', // 最后生成的接口
    push(code) {
      return context.code + code
    },
    indenLevel: 0,
    inden() {

    },
    dinden() {

    }
  }

  function newLine(n) {
    context.push('\n' + '  '.repeat(n))
  }

  return context
}

export function generate(ast) {
  const context = createGenerate(ast)  
}
