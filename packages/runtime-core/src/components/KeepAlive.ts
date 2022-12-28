export const KeepAliveImpl = {
  __isKeepAlive: true
}

export const isKeepAlive = vnode => vnode.type.__isKeepAlive
