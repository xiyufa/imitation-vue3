import { pathcAttr } from './modules/attr'
import { pathcClass } from './modules/class'
import { pathcEvents } from './modules/events'
import { pathcStyle } from './modules/style'

export function patchProp(el, key, prevValue, nextValue) {
  // 类名 el.className
  if (key === 'class') {
    pathcClass(el, nextValue)
  } else if (key === 'style') {
    pathcStyle(el, prevValue, nextValue)
  } else if (/^on[^a-z]/.test(key)) {
    pathcEvents(el, key, nextValue)
  } else {
    pathcAttr(el, key, nextValue)
  }
}
