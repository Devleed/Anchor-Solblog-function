/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SolanaProviderState {
  isPhantom: boolean
  connect: () => any
  signAndSendTransaction: (tx: any) => any
}
