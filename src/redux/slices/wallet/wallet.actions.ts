import { setWalletConnected } from '.'
import { AppDispatch, RootState } from '../../configureStore'

// an action
export const connectPhantomWallet =
  () =>
  async (dispatch: AppDispatch, getState: () => RootState): Promise<void> => {
    try {
      const state = getState()

      if (state.solana.isPhantom) {
        const res = await state.solana.connect()

        dispatch(
          setWalletConnected({
            address: res.publicKey.toString(),
            isConnected: true,
          }),
        )
      }
    } catch (error) {
      console.error('Error: connectPhantomWallet() -', error)
    }
  }
