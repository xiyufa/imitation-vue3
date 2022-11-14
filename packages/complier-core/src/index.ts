import { NodeTypes } from './ast'

function createParserContext(template) {
  return {
    line: 1,
    column: 1,
    offset: 0,
    source: template, // 此字段会不停被进行解析 slice
    originSource: template
  }
}

function isEnd(context) {
  const source = context.source
  // 解析完为空字符串表示解析完毕
  return !source
}

/**
 * @funciton 根据当前上下文获取位置信息
 */
function getCursor(context) {
  const { line, column, offset } = context
  return {
    line,
    column,
    offset
  }
}

/**
 * @function 更新信息
 */
function advancePositionWithMutation(context, source, endIndex) {
  let lineCount = 0
  let linepos = -1
  for (let i = 0; i < endIndex; i++) {
    if (source.charCodeAt(i) == 10) {
      lineCount++
      linepos = i
    }
  }
  context.line += lineCount
  context.column =
    linepos == -1 ? context.column + endIndex : endIndex - linepos
}

/**
 * @function 更新最新的行列信息并删除解析的内容
 */
function advanceBy(context, endIndex) {
  let source = context.source
  advancePositionWithMutation(context, source, endIndex)

  context.source = context.source.slice(endIndex)
}

/**
 * @function 处理文本内容，并更新最新偏移量信息
 */
function parseTextData(context, endIndex) {
  const rawText = context.source.slice(0, endIndex)
  advanceBy(context, endIndex)
  return rawText
}

function getSelection(context, start, end?) {
  let tempEnd = end || getCursor(context)
  return {
    start,
    end: tempEnd,
    source: context.originSource.slice(start.offset, tempEnd.offset)
  }
}

function parseText(context) {
  const endTokens = ['{{', '<']

  let endIndex = context.source.length

  for (let i = 0; i < endTokens.length; i++) {
    let index = context.source.indexOf(endTokens[i], 1)
    if (index !== -1 && index < endIndex) {
      endIndex = index
    }
  }

  let start = getCursor(context)
  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content,
    loc: getSelection(context, start)
  }
}

function parseInterpolation(context) {
  const start = getCursor(context)
  const closeIndex = context.source.indexOf('}}', '{{')
  advanceBy(context, 2)
  const insetStart = getCursor(context)
  const insetEnd = getCursor(context)

  // 拿到原始内容
  const rawContentLength = closeIndex - 2
  let preContent = parseTextData(context, rawContentLength)
  let content = preContent.trim()
  let startOffset = preContent.indexOf(content)
  if (startOffset > 0) {
    advancePositionWithMutation(insetStart, preContent, startOffset)
  }
  let endOffset = startOffset + content.length
  advancePositionWithMutation(insetEnd, preContent, endOffset)

  advanceBy(context,2)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
      loc: getSelection(context, insetStart, insetEnd)
    },
    loc: getSelection(context, start)
  }
}

function parse(template) {
  // 创建一个解析上下文
  const context = createParserContext(template)

  const nodes = []
  while (!isEnd(context)) {
    const source = context.source
    let node
    if (source.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if (source.startsWith('<')) {
      node = 'qqq'
    }
    // 文本
    if (!node) {
      node = parseText(context)
    }
    nodes.push(node)
  }

  return nodes
}

export function compile(template) {
  // 将模板转成抽象语法数  （就是编译原理）
  const ast = parse(template)

  return ast
  // 对ast语法书进行一些预处理
  // transform(ast)

  // 生成最终代码
  // return generate(ast)
}
