import React, { FC, useEffect } from 'react'
import { Connection } from '@solana/web3.js'
import { Program, Provider, web3 } from '@project-serum/anchor'

import { useAppDispatch, useAppSelector } from '@hooks/'
import { setSolanaProvider } from '@redux/slices/solanaProvider/solanaProvider.actions'
import { connectPhantomWallet } from '@redux/slices/wallet/wallet.actions'
import TEST_GIFS from '../../testData.json'

import './styles.scss'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

type Props = Record<string, unknown>

const candyMachineProgram = new web3.PublicKey(
  'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',
)

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
)

const App: FC<Props> = () => {
  const dispatch = useAppDispatch()
  const solana = useAppSelector(state => state.solana)
  const wallet = useAppSelector(state => state.wallet)

  useEffect(() => {
    getCandyMachineState()
    window.addEventListener('load', dispatchSolanaProvider)
    return () => {
      window.removeEventListener('load', dispatchSolanaProvider)
    }
  }, [])

  function onConnectWalletPress() {
    dispatch(connectPhantomWallet())
  }
  function dispatchSolanaProvider() {
    dispatch(setSolanaProvider())
  }
  function getProvider() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!

    // * Create a new connection to the RPC solana server
    const connection = new Connection(rpcHost)

    // * Create a new provider (provider basically provides us the ability to interact with solana blockchain)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = new Provider(connection, (window as any).solana, {
      // ! I don't know what this does
      preflightCommitment: 'processed',
    })

    return provider
  }
  async function getCandyMachineState() {
    try {
      const provider = getProvider()

      // * fetch the idl of common candy machine program (candyMachineProgram is a contract address of common candy machine program like erc20 contract and idl is the abi of the smart contract)
      // ? candyMachineProgram with address (cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ) is a program account or in other words is a smart contract which means it's executable and in solana executable accounts cannot store state so a separate PDA (program driven account) is created which holds out NFT state
      const idl = await Program.fetchIdl(candyMachineProgram, provider)

      if (idl) {
        // * create new program instance with idl/abi and candyMachineProgram (contract address)
        const program = new Program(idl, candyMachineProgram, provider)

        // * fetches our candy machine account which holds our NFT state
        const candyMachine = await program.account.candyMachine.fetch(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          process.env.REACT_APP_CANDY_MACHINE_ID!,
        )

        const itemsAvailable = candyMachine.data.itemsAvailable.toNumber()
        const itemsRedeemed = candyMachine.itemsRedeemed.toNumber()
        const itemsRemaining = itemsAvailable - itemsRedeemed
        const goLiveData = candyMachine.data.goLiveDate.toNumber()
        const presale =
          candyMachine.data.whitelistMintSettings?.presale &&
          (!candyMachine.data.goLiveDate ||
            candyMachine.data.goLiveDate.toNumber() >
              new Date().getTime() / 1000)

        // We will be using this later in our UI so let's generate this now
        const goLiveDateTimeString = `${new Date(
          goLiveData * 1000,
        ).toUTCString()}`

        console.log({
          itemsAvailable,
          itemsRedeemed,
          itemsRemaining,
          goLiveData,
          goLiveDateTimeString,
          presale,
        })
      }
    } catch (error) {
      console.error('error =', error)
    }
  }
  async function mintToken() {
    try {
      // * create new account to hold out NFT
      const mint = web3.Keypair.generate()

      // * find program address by providing relevant info
      // ? arg1: connected user wallet address
      // ? arg2: visit (https://only1.gitbook.io/only1/tokenomics/technology/spl-token-program#:~:text=Token%20Program%20%2D%20Only1-,SPL%20Token%20Program,Token%20Program)
      // ? arg3: newly generated account public key
      const userTokenAccountAddress = await web3.PublicKey.findProgramAddress(
        [
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          new web3.PublicKey(wallet.address!).toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      )

      console.log('userTokenAccountAddress = ', userTokenAccountAddress)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="app_container">
      <h4>Counter App</h4>
      {solana.isPhantom ? (
        <button onClick={onConnectWalletPress}>Connect Phantom Wallet</button>
      ) : null}
      {wallet.isConnected ? (
        <h5>Connected with address {wallet.address}</h5>
      ) : null}
      <div className="gif-grid">
        {TEST_GIFS.map(gif => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
