import React, { useEffect } from 'react'
import { useRelinx } from 'relinx'

import BottomBar from './BottomBar'
import GoodsView from './GoodsView'
import LoadMore from './LoadMore'

const styles = {
  body: {
    width: '100%',
    height: '100%',
  },

  simulator: {
    paddingTop: 15,
    paddingBottom: 50,
    width: 375,
    height: 667,
    backgroundColor: '#fff',
    marginTop: 50,
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 20,
    position: 'relative',
    border: '1px solid #000',
    boxSizing: 'border-box',
    display: 'flex',
  },
  goodsWrapper: {
    overflowY: 'auto',
    flex: 1,
  }
}

export default () => {
  const [_, dispatch] = useRelinx()

  useEffect(() => {
    dispatch([{
      type: 'init/updateOnline',
    }, {
      type: 'init/getGoodsList',
    }])

    // dispatch([{
    //   type: 'goods/incrementItemCount',
    //   payload: { id: 1}
    // }, {
    //   type: 'goods/decrementItemCount',
    //   payload: { id: 2}
    // }])
  }, [])

  return (
    <div style={styles.body}>
      <div style={styles.simulator}>
        <div style={styles.goodsWrapper}>
          <GoodsView />
          <LoadMore />
        </div>
        <BottomBar />
      </div>
    </div>
  )
}