import { setSolanaState } from '.'
import { AppDispatch } from '../../configureStore'

// an action
export const setSolanaProvider =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { solana } = window as any

      if (solana) {
        dispatch(
          setSolanaState({
            isPhantom: solana.isPhantom,
            connect: solana.connect,
          }),
        )
      }
    } catch (error) {
      console.error('Error: setSolanaProvider() -', error)
    }
  }
