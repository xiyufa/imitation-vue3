export const TO_DISPLAY_STRING = Symbol('toDisplayString')
export const CREATE_TEXT = Symbol('createTextVnode')
export const CREATE_ELEMENT_VNODE = Symbol('createElementVnode')

export const helperMap = {
  [TO_DISPLAY_STRING]: 'toDisplayString',
  [CREATE_TEXT]: 'createTextVnode',
  [CREATE_ELEMENT_VNODE]: 'createElementVnode'
}
