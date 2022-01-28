export interface SolanaProviderState {
  isPhantom: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connect: () => any
}
