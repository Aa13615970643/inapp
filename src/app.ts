import { PropsWithChildren } from 'react'
import { useDidShow } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './app.scss'

function App(props: PropsWithChildren<any>) {
  useDidShow(() => {
    const token = Taro.getStorageSync('token')
    if (token ) {
      Taro.switchTab
          ({
            url: '/pages/index/index',
          });
    }
  })

  return props.children
}

export default App