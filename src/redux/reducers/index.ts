import { combineReducers } from 'redux'
import solanaReducer from '../slices/solanaProvider'

const reducers = combineReducers({
  solana: solanaReducer,
})

export default reducers
