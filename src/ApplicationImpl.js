import invariant from 'invariant'
import PathNode from './PathNode'
import is from './utils/is'

class ApplicationImpl {
  constructor(base) {
    this.base = base
    this.node = new PathNode()
    this.pendingPatchers =[]
  }

  update(values) {
    this.pendingPatchers = []
    values.forEach(value => this.treeShake(value))
    values.forEach(value => this.updateBase(value))
    if (this.pendingPatchers) {
      this.pendingPatchers.forEach(patcher => patcher.triggerAutoRun())
    }
  }

  updateBase({ storeKey, changedValue }) {
    const origin = this.base[storeKey]
    this.base[storeKey] = { ...origin, ...changedValue }
  }

  treeShake({ storeKey, changedValue }) {
    const branch = this.node
    const baseValue = this.base[storeKey]
    const nextValue = { baseValue, ...changedValue }

    const compare = (branch, baseValue, nextValue) => {
      if (is(baseValue, nextValue)) return
      if (branch.patchers.length) {
        branch.patchers.forEach(patcher => {
          patcher.markDirty()
          this.pendingPatchers.push(patcher)
        })
      }
      const caredKeys = Object.keys(branch.children)
      caredKeys.forEach(key => {
        const childBranch = branch.children[key]
        const childBaseValue = baseValue[key]
        const childNextValue = nextValue[key]
        compare(childBranch, childBaseValue, childNextValue)
      })
    }

    compare(branch, baseValue, nextValue)
  }

  addPatcher(patcher) {
    const storeName = patcher.storeName
    const paths = patcher.paths

    paths.forEach(path => {
      const fullPath = [storeName].concat(path)
      this.node.addPathNode(fullPath, patcher)
    })
  }

  getStoreData(storeName) {
    const storeValue = this.base[storeName]

    // on iOS 10. toString(new Proxy({}, {}) === 'object ProxyObject')
    invariant(
      !!storeValue,
      `Invalid storeName '${storeName}'.` +
      'Please ensure `base[storeName]` return non-undefined value '
    )

    return storeValue
  }
}

export default ApplicationImpl