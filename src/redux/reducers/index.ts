import { combineReducers } from 'redux'
import counterReducer from '../slices/counterSlice'
import solanaReducer from '../slices/solanaProvider'
import walletReducer from '../slices/wallet'

const reducers = combineReducers({
  counter: counterReducer,
  solana: solanaReducer,
  wallet: walletReducer,
})

export default reducers
