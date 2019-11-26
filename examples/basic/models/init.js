import { getGoods } from '../data-source/goods'

export default {
  state: {
    page: 0,
    status: 'offline',
  },

  reducers: {
    updateState: (_, { status }) => ({ status }),
    updatePage: state => ({
      page: state.page + 1,
    }),
  },

  effects: {
    getGoodsList: () => (dispatch, getState) => {
      const { init: { page } } = getState()
      getGoods({ page }).then(result => {
        dispatch({
          type: 'goods/addGoods',
          payload: {
            goodsList: result,
          },
        })
        dispatch({
          type: 'updatePage',
        })
      })
    },
    updateOnline: () => dispatch => {
      dispatch({
        type: 'updateState',
        payload: { status: 'online' },
      })
    },
  },
}
