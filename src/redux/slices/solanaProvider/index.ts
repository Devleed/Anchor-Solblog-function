/* eslint-disable @typescript-eslint/no-empty-function */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SolanaProviderState } from './solanaProvider.types'

const initialState: SolanaProviderState = {
  isPhantom: false,
  connect: () => {},
  signAndSendTransaction: () => {},
}

export const solanaProvider = createSlice({
  name: 'solana',
  initialState,
  reducers: {
    setSolanaState: (state, action: PayloadAction<SolanaProviderState>) => {
      state.isPhantom = action.payload.isPhantom
      state.connect = action.payload.connect
      state.signAndSendTransaction = action.payload.signAndSendTransaction
    },
  },
})

export const { setSolanaState } = solanaProvider.actions

export default solanaProvider.reducer
