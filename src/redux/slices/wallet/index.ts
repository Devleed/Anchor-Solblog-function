import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WalletState } from './wallet.types'

const initialState: WalletState = {
  address: null,
  isConnected: false,
}

export const solanaProvider = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletConnected: (state, action: PayloadAction<WalletState>) => {
      state.address = action.payload.address
      state.isConnected = action.payload.isConnected
    },
  },
})

export const { setWalletConnected } = solanaProvider.actions

export default solanaProvider.reducer
