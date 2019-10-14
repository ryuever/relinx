import Computation from './Computation'
import central from './central'
import shouldWrappedByProxy from './utils/shouldWrappedByProxy'

let count = 0

// https://2ality.com/2016/11/proxying-builtins.html
// https://exploringjs.com/es6/ch_proxies.html

// 如果说存在的话，就返回相应的值，但是目前需要区分这个是否需要register
// 是否需要提供一个时机进行设置`timeToRegister`
// types could be wrapped by Proxy
const createHandler = (initialState = {}, comp, paths = [], reactivePath, id) => ({
  get: (target, property, receiver) => {
    console.log('get property : ', property, comp)
    debugger
    let originalValue = Reflect.get(initialState, property, receiver)

    // 支持指定关心的路径
    if (reactivePath.length > 0) {
      const fullPaths = [].concat(paths, property)
      const fullPathsLength = fullPaths.length
      const len = reactivePath.length
      let matched = false

      for (let i = 0; i < len; i++) {
        const parts = reactivePath[i].split('\.')
        const innerLength = parts.length
        let isBreak = false

        if (fullPathsLength !== innerLength) break

        for (let j = 0; j < innerLength; j++) {
          if (parts[j] !== fullPaths[j]) {
            isBreak = true
            break;
          }
        }

        if (!isBreak) {
          matched = true
          break;
        }
      }

      if (matched) {
        console.log('registb: ', paths, property)
        central.register({ paths, comp, property, id })
      }
    } else if (target.hasOwnProperty(property)) {
      console.log('regist x : ', paths, property)
      central.register({ paths, comp, property, id })
    }

    const type = Object.prototype.toString.call(originalValue)
    if (shouldWrappedByProxy(originalValue)) {
      let nextValue = originalValue
      if (type === '[object Object]') {
        nextValue = { ...originalValue }
      }

      if (type === '[object Array]') {
        nextValue = [ ...originalValue ]
      }

      const next = new Proxy(nextValue, createHandler(
        nextValue,
        comp,
        paths.concat(property),
        reactivePath,
        id,
      ))
      Reflect.set(target, property, next, receiver)
    }

    return Reflect.get(target, property, receiver)
  },
})

function useTracker(fn, name, reactivePath = []) {
  count++
  const computation = new Computation(fn, name)
  const initialState = central.getCurrent()
  // Promise.resolve().then(() => central.flush())
  // setTimeout(() => central.flush(), 0)
  // 如果说这里面的target使用`initialState`的话，`initialState`相当于被各种覆盖
  // 所以一定要确保经过`createHeader`一系列操作以后，`initialState`要依旧只含`plain object`；
  // 不能够被`Proxy`污染

  // console.log('reactive : ', reactivePath)

  console.log('create -', count)

  return [
    new Proxy({}, createHandler(initialState, computation, [], reactivePath, `${count}`)),
    () => computation.markAsDirty()
  ]
}

export default useTracker
