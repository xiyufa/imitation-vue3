export function pathcClass(el: Element, nextValue) {
  if (nextValue === 'null') {
    el.removeAttribute('class')
  } else {
    el.className  = nextValue
  }
}
