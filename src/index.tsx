import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import 'emoji-mart/css/emoji-mart.css'

import Root from 'components/Root'
import store from 'config/store'

const rootElement = document.getElementById('root')

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Root />
    </Provider>
  </React.StrictMode>,
  rootElement
)
