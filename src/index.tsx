import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store } from '@redux/configureStore'
import WalletWrapper from '@components/WalletWrapper'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <WalletWrapper />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)
