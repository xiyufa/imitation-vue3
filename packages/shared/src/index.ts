export const isObject = value => {
  return typeof value === 'object' && value !== null
}
export const inNumber = value => {
  return typeof value === 'number'
}
export const isFunction = value => {
  return typeof value === 'function'
}
export const isString = value => {
  return typeof value === 'string'
}

export const isArray = Array.isArray

export const assign = Object.assign

export const hasOwnProperty = Object.prototype.hasOwnProperty

export const hasOwn = (value, key) => hasOwnProperty.call(value, key)

// vue3 提供的形状标识
export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATRFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREBN = 1 << 3,
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEPP_ALICE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATRFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
