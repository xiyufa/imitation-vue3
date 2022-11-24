import { NodeTypes } from './ast'
import { helperMap, TO_DISPLAY_STRING } from './runtimeHelpers'
function createGenerate(ast) {
  const context = {
    code: '', // 最后生成的接口
    helper(name) {
      return `${helperMap[name]}`
    },
    push(code) {
      context.code += code
    },
    indenLevel: 0,
    inden() {
      ++context.indenLevel
      context.newLine()
    },
    deinden(withoutNewLine = false) {
      if (withoutNewLine) {
        --context.indenLevel
      } else {
        --context.indenLevel
        context.newLine()
      }
    },
    newLine() {
      newLine(context.indenLevel)
    }
  }

  function newLine(n) {
    context.push('\n' + '  '.repeat(n))
  }

  return context
}

function genFunctionPreable(ast, context) {
  if (ast.helpers.length <= 0) return
  const funText = ast.helpers
    .map(h => `${context.helper(h)} as _${context.helper(h)}`)
    .join(', ')

  context.push(`import { ${funText} } from 'vue'`)
  context.newLine()
  context.newLine()
  context.push('export ')
}

function genText(node, context) {
  context.push(JSON.stringify(node.content))
}
function genIntepolation(node, context) {
  context.push(`_${helperMap[TO_DISPLAY_STRING]}(`)
  genNode(node.content, context)
  context.push(')')
}
function genSimpleExpression(node, context) {
  context.push(node.content)
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genIntepolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genSimpleExpression(node, context)
      break
  }
}

export function generate(ast) {
  const context = createGenerate(ast)

  const { push, inden, deinden } = context

  genFunctionPreable(ast, context)

  const functionName = 'render'
  const args = ['_ctx', '_cache', '_$props'].join(', ')

  push(`function ${functionName}(${args}) {`)
  inden()
  push('return ')

  if (ast.codegenNode) {
    genNode(ast.codegenNode, context)
  } else {
    push('null')
  }

  deinden()
  push('}')
}
