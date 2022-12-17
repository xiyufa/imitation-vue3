export const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    let { mounthChildren, patchChildren, move } = internals
    if (!n1) {
      const target = document.querySelector(n2.props.to)
      if (target) {
        mounthChildren(n2.children, target)
      }
    } else {
      patchChildren(n1, n2, container)
      if (n2.props.to !== n1.props.to) {
        const nextTarget = document.querySelector(n2.props.to)

        n2.children.forEach(child => {
          move(child, nextTarget)
        })
      }
    }
  }
}

export const isTeleport = type => type.__isTeleport
