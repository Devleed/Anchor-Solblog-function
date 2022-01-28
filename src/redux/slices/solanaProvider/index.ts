import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SolanaProviderState } from './solanaProvider.types'

const initialState: SolanaProviderState = {
  isPhantom: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  connect: () => {},
}

export const solanaProvider = createSlice({
  name: 'solana',
  initialState,
  reducers: {
    setSolanaState: (state, action: PayloadAction<SolanaProviderState>) => {
      state.isPhantom = action.payload.isPhantom
      state.connect = action.payload.connect
    },
  },
})

export const { setSolanaState } = solanaProvider.actions

export default solanaProvider.reducer
