import {
  isObject,
  TRACKER,
  shallowCopy,
  isTrackable,
  hasOwnProperty,
  createHiddenProperty
} from "./commons"
import ProxyTracker from "./ProxyTracker"

import context from "./context"

const peek = (proxy, accessPath) =>
  // eslint-disable-line
  accessPath.reduce((proxy, cur) => {
    proxy.setProp("isPeeking", true)
    const nextProxy = proxy[cur]
    proxy.setProp("isPeeking", false)
    return nextProxy
  }, proxy)

function createTracker(target, config, trackerNode) {
  const {accessPath = [], parentProxy, useRevoke, useScope, rootPath = []} =
    config || {}

  if (!isObject(target)) {
    throw new TypeError(
      "Cannot create proxy with a non-object as target or handler"
    )
  }

  const copy = shallowCopy(target)

  const internalProps = [
    TRACKER,
    "revoke",
    "runFn",
    "unlink",
    "getProp",
    "setProp",
    "getProps",
    "createChild"
  ]

  // can not use this in handler, should be `target`
  const handler = {
    get: (target, prop, receiver) => {
      target.runFn("assertScope")
      if (prop === TRACKER) return Reflect.get(target, prop, receiver)
      // assertScope(trackerNode, context.trackerNode)
      const base = target.getProp("base")

      // refer to immer...
      // if (Array.isArray(tracker)) target = tracker[0]
      const isInternalPropAccessed = internalProps.indexOf(prop) !== -1
      if (isInternalPropAccessed || !hasOwnProperty(base, prop)) {
        // Basically, access path is meaningful only if it's state value's own property.
        // In this condition, it should be Symbol access like `symbol.tostringtag` or
        // `symbol.iterator`
        return Reflect.get(target, prop, receiver)

        // if (typeof reflectValue === "undefined") {
        //   // console.warn(
        //   //   `Maybe you are using an un-declared props ${prop}\n` +
        //   //   `You'd better declare this prop first, or the reported paths` +
        //   //   'will not works well on `ES5`'
        //   // )
        // } else return reflectValue
      }
      const accessPath = target.getProp("accessPath")
      const nextAccessPath = accessPath.concat(prop)
      const isPeeking = target.getProp("isPeeking")

      if (!isPeeking) {
        // for relink return parent prop...
        if (context.trackerNode && trackerNode.id !== context.trackerNode.id) {
          const contextProxy = context.trackerNode.proxy
          const propProperties = contextProxy.getProp("propProperties")
          propProperties.push({
            path: nextAccessPath,
            source: trackerNode.proxy,
            target
          })
          target.setProp("propProperties", propProperties)
          return peek(trackerNode.proxy, nextAccessPath)
        }
        target.runFn("reportAccessPath", nextAccessPath)
      }
      const childProxies = target.getProp("childProxies")
      const value = base[prop]

      if (!isTrackable(value)) return value
      const childProxy = childProxies[prop]

      // for rebase value, if base value change, the childProxy should
      // be replaced
      if (childProxy && childProxy.getProp("base") === value) {
        return childProxy
      }
      return (childProxies[prop] = createTracker(
        value,
        {
          accessPath: nextAccessPath,
          parentProxy: target,
          rootPath,
          useRevoke,
          useScope
        },
        trackerNode
      ))
    }
  }

  const tracker = new ProxyTracker({
    base: target,
    parentProxy,
    accessPath,
    rootPath,
    trackerNode,
    useRevoke,
    useScope
  })

  const {proxy, revoke} = Proxy.revocable(copy, handler)

  createHiddenProperty(proxy, "getProps", function() {
    const args = Array.prototype.slice.call(arguments) // eslint-disable-line
    return args.map(prop => this[TRACKER][prop])
  })
  createHiddenProperty(proxy, "getProp", function() {
    const args = Array.prototype.slice.call(arguments) // eslint-disable-line
    return this[TRACKER][args[0]]
  })
  createHiddenProperty(proxy, "setProp", function() {
    const args = Array.prototype.slice.call(arguments) // eslint-disable-line
    const prop = args[0]
    const value = args[1]
    return (this[TRACKER][prop] = value)
  })
  createHiddenProperty(proxy, "runFn", function() {
    const args = Array.prototype.slice.call(arguments) // eslint-disable-line
    const fn = this[TRACKER][args[0]]
    const rest = args.slice(1)
    if (typeof fn === "function") return fn.apply(this, rest)
  })
  createHiddenProperty(proxy, "unlink", function() {
    return this.runFn("unlink")
  })
  createHiddenProperty(proxy, "createChild", function() {
    const args = Array.prototype.slice.call(arguments) // eslint-disable-line
    const target = args[0] || {}
    const config = args[1] || {}
    return createTracker(
      target,
      {
        useRevoke,
        useScope,
        rootPath,
        ...config
      },
      trackerNode
    )
  })
  createHiddenProperty(proxy, "revoke", function() {
    const useRevoke = this.getProp("useRevoke")
    if (useRevoke) revoke()
  })

  createHiddenProperty(proxy, TRACKER, tracker)

  return proxy
}

export default createTracker
