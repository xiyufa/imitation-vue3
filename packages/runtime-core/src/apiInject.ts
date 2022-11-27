import { currentInstance } from './component'
export function provide(key, value) {
  if (!currentInstance) return

  const parentProvides =
    currentInstance.parent && currentInstance.parent.provide
  let provides = currentInstance.provides

  if (parentProvides === provides) {
    provides = currentInstance.provides = Object.create(parentProvides)
  }

  provides[key] = value
}

export function inject(key) {
  if (!currentInstance) return

  const provides = currentInstance.parent && currentInstance.parent.provides

  if (provides && key in provides) {
    return provides[key]
  }
}
