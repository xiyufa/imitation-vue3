export const nodeOps = {
  // 增加节点
  inset(child, parent, anchor = null) {
    parent.insertBefore(child, anchor)
  },
  // 删除节点
  remove(child) {
    const parentNode = child.parentNode
    if (parentNode) {
      parentNode.removeChild(child)
    }
  },
  setElementText(el, test) {
    el.textContent = test
  },
  setText(node, test) {
    node.nodeValue = test
  },
  querySelector(seletor) {
    return document.querySelector(seletor)
  },
  parentNode(node) {
    return node.parentNode
  },
  nexSibling(node) {
    return node.nextSibling
  },
  createElement(tagName) {
    return document.createElement(tagName)
  },
  createText(text) {
    return document.createTextNode(text)
  }
}
