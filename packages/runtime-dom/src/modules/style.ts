export function pathcStyle(el, prevValue, nextValue = {}) {
  // 样式比较
  for (let key in nextValue) {
    el.style[key] = nextValue[key]
  }

  if (prevValue) {
    for (let key in prevValue) {
      if (!nextValue[key] == null) {
        el.style[key] = null
      }
    }
  }
}
