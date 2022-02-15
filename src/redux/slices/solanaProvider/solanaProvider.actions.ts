import { setSolanaState } from '.'
import { AppDispatch } from '../../configureStore'

// an action
export const setSolanaProvider =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { solana } = window as any

      console.log('solana -', solana, solana.signAndSendTransaction)

      if (solana) {
        dispatch(
          setSolanaState({
            isPhantom: solana.isPhantom,
            connect: solana.connect,
            signAndSendTransaction: solana.signAndSendTransaction,
          }),
        )
      }
    } catch (error) {
      console.error('Error: setSolanaProvider() -', error)
    }
  }
