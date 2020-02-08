// import canIUseProxy from './utils/canIUseProxy'
import { canIUseProxy, TRACKER } from './commons'
import { createES5Tracker } from './es5'
import { createTracker } from './proxy'
import context from './context'
import TrackerNode from './TrackerNode'

/**
 * resolve `reactivePaths`, and wrap `autoRunFunc`
 * @param {*} param0
 */
const Tracker = ({
  base,
  useProxy = true,
  parent,
}) => {
  const verifiedUseProxy = canIUseProxy() && useProxy
  const fn = verifiedUseProxy ? createTracker : createES5Tracker
  const parentTrackerNode = typeof parent !== 'undefined' ? parent : context.trackerNode
  let isSibling = false

  // console.log('parent ', parent, context.trackerNode, parentTrackerNode)

  // re-create a top most node
  if (!parentTrackerNode) {
    if (context.trackerNode) {
      context.trackerNode.revoke()
    }
  } else {
    if (!context.trackerNode) throw new Error(
      'Maybe you are assign an invalid `parent`, which should define first'
    )
    // if (parent !== context.trackerNode.parent) throw new Error(
    //   'You are only admitted to assign an directly parent of value ' +
    //   JSON.stringify(context.trackerNode.parent)
    // )
    if (parentTrackerNode === context.trackerNode) {
      // Add the first child, for sibling, intersection access is forbidden.
      parentTrackerNode.revokeLastChild()
    } else {
      // add sibling, or create new branch....so `revokeUntil` is required.
      console.log('context node ', context.trackerNode)
      context.trackerNode.revokeUntil(parentTrackerNode)
    }

    if (parentTrackerNode === context.trackerNode.parent) {
      isSibling = true
    }
  }

  const node = new TrackerNode(parentTrackerNode, isSibling)
  context.trackerNode = node
  const tracker = fn(base, {}, context.trackerNode)

  node.tracker = tracker

  return node
}

const store = {
  a: {
    a1: { a11: 1 },
    a2: { a21: { a211: 9 }},
    a3: { a31: [{ a311: 7 }]}
  },
  b: {
    b1: { b11: 1 },
    b2: { b21: { b211: 9 }},
    b3: { b31: [{ b311: 7 }]}
  },
  c: {
    c1: { c11: 1 },
    c2: { c21: { c211: 9 }},
    c3: { c31: [{ c311: 7 }]}
  },
}

const trackerNodeA = Tracker({ base: store.a })
console.log('create a1')
const trackerNodeA1 = Tracker({ base: store.a.a1 })
console.log('create a2')

const trackerNodeA2 = Tracker({ base: store.a.a2, parent: trackerNodeA })
console.log('create a3')

const trackerNodeA3 = Tracker({ base: store.a.a3, parent: trackerNodeA })
console.log('tracker node a ', trackerNodeA)

export default Tracker