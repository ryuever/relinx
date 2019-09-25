import compose from './utils/compose'

export default function applyMiddleware(...middlewares) {
  const nextMiddlewares = [...middlewares]
  return createStore => (...args) => {
    const store = createStore(...args)
    const { reducers, effects, initialState } = store

    const api = {
      dispatch: (...args) => store.dispatch(...args),
      getState: () => initialState,
      reducers,
      effects,
    }

    const chain = nextMiddlewares.map(middleware => middleware(api))
    const createDispatch = setValue => {
      store.dispatch = compose(...chain)(setValue)
      return store.dispatch
    }

    return {
      ...store,
      createDispatch,
    }
  }
}