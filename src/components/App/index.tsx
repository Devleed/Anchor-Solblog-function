/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useEffect } from 'react'
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { Program, Provider, web3, IdlTypes, Idl } from '@project-serum/anchor'
import {
  AccountLayout,
  MintLayout,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { TypeDef } from '@project-serum/anchor/dist/cjs/program/namespace/types'
import { IdlTypeDef } from '@project-serum/anchor/dist/cjs/idl'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const b58 = require('b58')

import { useAppDispatch, useAppSelector } from '@hooks/'
import { setSolanaProvider } from '@redux/slices/solanaProvider/solanaProvider.actions'
import { connectPhantomWallet } from '@redux/slices/wallet/wallet.actions'
import idl from '../../idl.json'

import './styles.scss'

type Props = Record<string, unknown>

const candyMachineProgram = new web3.PublicKey(
  'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',
)
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
)
const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
)
const CIVIC = new web3.PublicKey('gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs')

function getAtaForMint(walletAddress: string, mint: PublicKey) {
  // * find program address by providing relevant info
  // ? arg1: connected user wallet address
  // ? arg2: visit (https://only1.gitbook.io/only1/tokenomics/technology/spl-token-program#:~:text=Token%20Program%20%2D%20Only1-,SPL%20Token%20Program,Token%20Program)
  // ? arg3: newly generated account public key
  return web3.PublicKey.findProgramAddress(
    [
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      getWeb3PublicKey(walletAddress).toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  )
}
function getWeb3PublicKey(address: string) {
  return new web3.PublicKey(address)
}
function createAssociatedTokenAccountInstruction(
  associatedTokenAddress: PublicKey,
  payer: PublicKey,
  walletAddress: PublicKey,
  splTokenMintAddress: PublicKey,
) {
  const keys = [
    {
      pubkey: payer,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: walletAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: splTokenMintAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ]
  return new TransactionInstruction({
    keys,
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    data: Buffer.from([]),
  })
}
async function getNetworkToken(
  wallet: PublicKey,
  gatekeeperNetwork: PublicKey,
) {
  return await web3.PublicKey.findProgramAddress(
    [
      wallet.toBuffer(),
      Buffer.from('gateway'),
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]),
      gatekeeperNetwork.toBuffer(),
    ],
    CIVIC,
  )
}
async function getNetworkExpire(gatekeeperNetwork: PublicKey) {
  return await web3.PublicKey.findProgramAddress(
    [gatekeeperNetwork.toBuffer(), Buffer.from('expire')],
    CIVIC,
  )
}
async function getMetadata(mint: PublicKey) {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0]
}
async function getMasterEdition(mint: PublicKey) {
  // ? A master edition token, when minted, represents both a non-fungible token on Solana and metadata that allows creators to control the provenance of prints created from the master edition.
  // ? A print represents a copy of an NFT, and is created from a Master Edition. Each print has an edition number associated with it.
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0]
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCandyMachineCreator(candyMachine: any) {
  const candyMachineID = new PublicKey(candyMachine)
  return await web3.PublicKey.findProgramAddress(
    [Buffer.from('candy_machine'), candyMachineID.toBuffer()],
    candyMachineProgram,
  )
}
function getUnixTs() {
  return new Date().getTime() / 1000
}
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
async function awaitTransactionSignatureConfirmation(
  txid: any,
  timeout: any,
  connection: any,
  commitment = 'recent',
  queryStatus = false,
) {
  let done = false
  let status = {
    slot: 0,
    confirmations: 0,
    err: null,
  }
  let subId = 0
  // eslint-disable-next-line no-async-promise-executor
  status = await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (done) {
        return
      }
      done = true
      console.log('Rejecting for timeout...')
      reject({ timeout: true })
    }, timeout)
    try {
      subId = connection.onSignature(
        txid,
        (result: any, context: any) => {
          done = true
          status = {
            err: result.err,
            slot: context.slot,
            confirmations: 0,
          }
          if (result.err) {
            console.log('Rejected via websocket', result.err)
            reject(status)
          } else {
            console.log('Resolved via websocket', result)
            resolve(status)
          }
        },
        commitment,
      )
    } catch (e) {
      done = true
      console.error('WS error in setup', txid, e)
    }
    while (!done && queryStatus) {
      // eslint-disable-next-line no-loop-func
      // eslint-disable-next-line prettier/prettier
      try {
        const signatureStatuses = await connection.getSignatureStatuses([txid])
        status = signatureStatuses && signatureStatuses.value[0]
        if (!done) {
          if (!status) {
            console.log('REST null result for', txid, status)
          } else if (status.err) {
            console.log('REST error for', txid, status)
            done = true
            reject(status.err)
          } else if (!status.confirmations) {
            console.log('REST no confirmations for', txid, status)
          } else {
            console.log('REST confirmation for', txid, status)
            done = true
            resolve(status)
          }
        }
      } catch (e) {
        if (!done) {
          console.log('REST connection error: txid', txid, e)
        }
      }
      await sleep(2000)
    }
  })

  if (connection._signatureSubscriptions[subId])
    connection.removeSignatureListener(subId)
  done = true
  console.log('Returning status', status)
  return status
}
async function sendSignedTransaction({
  signedTransaction,
  connection,
  timeout = 15000,
}: {
  signedTransaction: any
  connection: any
  timeout: number
}) {
  const rawTransaction = signedTransaction.serialize()
  const startTime = getUnixTs()
  let slot = 0
  const txid = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: true,
  })

  console.log('Started awaiting confirmation for', txid)
  // eslint-disable-next-line prettier/prettier
  let done = false

  // eslint-disable-next-line prettier/prettier
  while (!done && getUnixTs() - startTime < timeout) {
    connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
    })
    await sleep(500)
  }
  try {
    const confirmation = await awaitTransactionSignatureConfirmation(
      txid,
      timeout,
      connection,
      'recent',
      true,
    )

    if (!confirmation)
      throw new Error('Timed out awaiting confirmation on transaction')

    if (confirmation.err) {
      console.error(confirmation.err)
      throw new Error('Transaction failed: Custom instruction error')
    }

    slot = confirmation?.slot || 0
  } catch (err: any) {
    console.error('Timeout Error caught', err)
    // if (err.timeout) {
    //   throw new Error('Timed out awaiting confirmation on transaction')
    // }
    // let simulateResult = null
    // try {
    //   simulateResult = (
    //     await simulateTransaction(connection, signedTransaction, 'single')
    //   ).value
    // } catch (e) {}
    // if (simulateResult && simulateResult.err) {
    //   if (simulateResult.logs) {
    //     for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
    //       const line = simulateResult.logs[i]
    //       if (line.startsWith('Program log: ')) {
    //         throw new Error(
    //           'Transaction failed: ' + line.slice('Program log: '.length),
    //         )
    //       }
    //     }
    //   }
    //   throw new Error(JSON.stringify(simulateResult.err))
    // }
    // throw new Error('Transaction failed');
  } finally {
    done = true
  }

  console.log('Latency', txid, getUnixTs() - startTime)
  return { txid, slot }
}
async function sendTransactions(
  connection: any,
  wallet: any,
  instructionSet: any,
  signersSet: any,
  sequenceType = 'Parallel',
  commitment = 'singleGossip',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  successCallback: (txid: any, ind: any) => void,
  failCallback: (txid: any, ind: any) => void,
  block?: any,
) {
  if (!wallet.publicKey) throw new WalletNotConnectedError()

  const unsignedTxns = []

  if (!block) {
    block = await connection.getRecentBlockhash(commitment)
  }

  for (let i = 0; i < instructionSet.length; i++) {
    const instructions = instructionSet[i]
    const signers = signersSet[i]

    if (instructions.length === 0) {
      continue
    }

    const transaction = new Transaction()
    instructions.forEach((instruction: any) => transaction.add(instruction))
    transaction.recentBlockhash = block.blockhash
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s: any) => s.publicKey),
    )

    if (signers.length > 0) {
      transaction.partialSign(...signers)
    }

    unsignedTxns.push(transaction)
  }

  const signedTxns = await wallet.signAllTransactions(unsignedTxns)

  const pendingTxns = []

  const breakEarlyObject = { breakEarly: false, i: 0 }
  console.log(
    'Signed txns length',
    signedTxns.length,
    'vs handed in length',
    instructionSet.length,
  )
  for (let i = 0; i < signedTxns.length; i++) {
    const signedTxnPromise = sendSignedTransaction({
      connection,
      signedTransaction: signedTxns[i],
      timeout: 15000,
    })

    signedTxnPromise
      .then(({ txid }) => {
        successCallback(txid, i)
      })
      .catch(() => {
        failCallback(signedTxns[i], i)
        if (sequenceType === 'StopOnFailure') {
          breakEarlyObject.breakEarly = true
          breakEarlyObject.i = i
        }
      })

    if (sequenceType !== 'Parallel') {
      try {
        await signedTxnPromise
      } catch (e) {
        console.log('Caught failure', e)
        if (breakEarlyObject.breakEarly) {
          console.log('Died on ', breakEarlyObject.i)
          // Return the txn we failed on by index
          return {
            number: breakEarlyObject.i,
            txs: await Promise.all(pendingTxns),
          }
        }
      }
    } else {
      pendingTxns.push(signedTxnPromise)
    }
  }

  if (sequenceType !== 'Parallel') {
    await Promise.all(pendingTxns)
  }

  return { number: signedTxns.length, txs: await Promise.all(pendingTxns) }
}

const secretKey =
  '5tgSepu28hP18obJCELv8MXnvuqGRK4M1oq67V63zWZjreQD8MDu7B5gNc5H8gKGy6DzF72Ax5eZcrxBZPtjR2ub'

const baseAccount = web3.Keypair.fromSecretKey(b58.decode(secretKey))

const App: FC<Props> = () => {
  const [candyMachineState, setCandyMachineState] = React.useState<TypeDef<
    IdlTypeDef,
    IdlTypes<Idl>
  > | null>(null)

  const dispatch = useAppDispatch()

  const reactConnection = useConnection()
  const phantomWallet = useWallet()

  const solana = useAppSelector(state => state.solana)
  const wallet = useAppSelector(state => state.wallet)

  useEffect(() => {
    // getCandyMachineState()
    window.addEventListener('load', dispatchSolanaProvider)
    return () => {
      window.removeEventListener('load', dispatchSolanaProvider)
    }
  }, [])
  useEffect(() => {
    if (solana && wallet.address) {
      // checkSolana()
    }
  }, [solana, wallet])
  useEffect(() => {
    console.log('phantomWallet changed -', phantomWallet)
  }, [phantomWallet])

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

        setCandyMachineState(candyMachine)

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

      const userTokenAccountAddress = (
        await getAtaForMint(wallet.address!, mint.publicKey)
      )[0]

      console.log('userTokenAccountAddress = ', userTokenAccountAddress)

      // * creating params to mint NFT userPayingAccountAddress is the address which is paying + receiving the NFT
      const userPayingAccountAddress = candyMachineState?.state.tokenMint
        ? (
            await getAtaForMint(
              wallet.address!,
              candyMachineState.state.tokenMint!,
            )
          )[0]
        : getWeb3PublicKey(wallet.address!)

      console.log('userPayingAccountAddress = ', userPayingAccountAddress)

      const candyMachineAddress = candyMachineState?.id
      const remainingAccounts = []
      const signers = [mint]
      const cleanupInstructions = []

      // * Creating instructions which will be followed in a transaction
      const instructions = [
        web3.SystemProgram.createAccount({
          fromPubkey: getWeb3PublicKey(wallet.address!),
          newAccountPubkey: mint.publicKey,
          space: MintLayout.span,
          lamports:
            await candyMachineState?.program.provider.connection.getMinimumBalanceForRentExemption(
              MintLayout.span,
            ),
          programId: TOKEN_PROGRAM_ID,
        }),
        Token.createInitMintInstruction(
          TOKEN_PROGRAM_ID,
          mint.publicKey,
          0,
          getWeb3PublicKey(wallet.address!),
          getWeb3PublicKey(wallet.address!),
        ),
        createAssociatedTokenAccountInstruction(
          userTokenAccountAddress,
          getWeb3PublicKey(wallet.address!),
          getWeb3PublicKey(wallet.address!),
          mint.publicKey,
        ),
        Token.createMintToInstruction(
          TOKEN_PROGRAM_ID,
          mint.publicKey,
          userTokenAccountAddress,
          getWeb3PublicKey(wallet.address!),
          [],
          1,
        ),
      ]

      if (candyMachineState?.state.gatekeeper) {
        remainingAccounts.push({
          pubkey: (
            await getNetworkToken(
              getWeb3PublicKey(wallet.address!),
              candyMachineState?.state.gatekeeper.gatekeeperNetwork,
            )
          )[0],
          isWritable: true,
          isSigner: false,
        })
        if (candyMachineState?.state.gatekeeper.expireOnUse) {
          remainingAccounts.push({
            pubkey: CIVIC,
            isWritable: false,
            isSigner: false,
          })
          remainingAccounts.push({
            pubkey: (
              await getNetworkExpire(
                candyMachineState?.state.gatekeeper.gatekeeperNetwork,
              )
            )[0],
            isWritable: false,
            isSigner: false,
          })
        }
      }
      if (candyMachineState?.state.gatekeeper.expireOnUse) {
        remainingAccounts.push({
          pubkey: CIVIC,
          isWritable: false,
          isSigner: false,
        })
        remainingAccounts.push({
          pubkey: (
            await getNetworkExpire(
              candyMachineState?.state.gatekeeper.gatekeeperNetwork,
            )
          )[0],
          isWritable: false,
          isSigner: false,
        })
      }
      if (candyMachineState?.state.whitelistMintSettings) {
        const mint = new web3.PublicKey(
          candyMachineState?.state.whitelistMintSettings.mint,
        )

        const whitelistToken = (await getAtaForMint(wallet.address!, mint))[0]
        remainingAccounts.push({
          pubkey: whitelistToken,
          isWritable: true,
          isSigner: false,
        })

        if (candyMachineState?.state.whitelistMintSettings.mode.burnEveryTime) {
          const whitelistBurnAuthority = web3.Keypair.generate()

          remainingAccounts.push({
            pubkey: mint,
            isWritable: true,
            isSigner: false,
          })
          remainingAccounts.push({
            pubkey: whitelistBurnAuthority.publicKey,
            isWritable: false,
            isSigner: true,
          })
          signers.push(whitelistBurnAuthority)
          const exists =
            await candyMachineState?.program.provider.connection.getAccountInfo(
              whitelistToken,
            )
          if (exists) {
            instructions.push(
              Token.createApproveInstruction(
                TOKEN_PROGRAM_ID,
                whitelistToken,
                whitelistBurnAuthority.publicKey,
                getWeb3PublicKey(wallet.address!),
                [],
                1,
              ),
            )
            cleanupInstructions.push(
              Token.createRevokeInstruction(
                TOKEN_PROGRAM_ID,
                whitelistToken,
                getWeb3PublicKey(wallet.address!),
                [],
              ),
            )
          }
        }
      }
      if (candyMachineState?.state.tokenMint) {
        const transferAuthority = web3.Keypair.generate()

        signers.push(transferAuthority)
        remainingAccounts.push({
          pubkey: userPayingAccountAddress,
          isWritable: true,
          isSigner: false,
        })
        remainingAccounts.push({
          pubkey: transferAuthority.publicKey,
          isWritable: false,
          isSigner: true,
        })

        instructions.push(
          Token.createApproveInstruction(
            TOKEN_PROGRAM_ID,
            userPayingAccountAddress,
            transferAuthority.publicKey,
            getWeb3PublicKey(wallet.address!),
            [],
            candyMachineState?.state.price.toNumber(),
          ),
        )
        cleanupInstructions.push(
          Token.createRevokeInstruction(
            TOKEN_PROGRAM_ID,
            userPayingAccountAddress,
            getWeb3PublicKey(wallet.address!),
            [],
          ),
        )
      }

      const metadataAddress = await getMetadata(mint.publicKey)
      const masterEdition = await getMasterEdition(mint.publicKey)

      const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(
        candyMachineAddress,
      )

      instructions.push(
        await candyMachineState?.program.instruction.mintNft(creatorBump, {
          accounts: {
            candyMachine: candyMachineAddress,
            candyMachineCreator,
            payer: getWeb3PublicKey(wallet.address!),
            wallet: candyMachineState?.state.treasury,
            mint: mint.publicKey,
            metadata: metadataAddress,
            masterEdition,
            mintAuthority: getWeb3PublicKey(wallet.address!),
            updateAuthority: getWeb3PublicKey(wallet.address!),
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: web3.SYSVAR_RENT_PUBKEY,
            clock: web3.SYSVAR_CLOCK_PUBKEY,
            recentBlockhashes: web3.SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
            instructionSysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
          },
          remainingAccounts:
            remainingAccounts.length > 0 ? remainingAccounts : undefined,
        }),
      )

      const recentBlockhash = (
        await reactConnection.connection.getRecentBlockhash()
      ).blockhash

      const transaction = new Transaction({
        feePayer: new web3.PublicKey(wallet.address!),
        recentBlockhash,
      })
        .add(...instructions)
        .add(...cleanupInstructions)
        .sign(...signers.map(signer => signer))

      candyMachineState?.program.provider.wallet.signAllTransactions()

      await sendTransactions(
        candyMachineState?.program.provider.connection,
        candyMachineState?.program.provider.wallet,
        [instructions, cleanupInstructions],
        [signers, []],
        'Parallel',
        'singleGossip',
        txId => {
          console.log('tx id -', txId)
        },
        err => {
          console.log('tx err -', err)
        },
      )
    } catch (error) {
      console.error(error)
    }
  }
  async function checkSolana() {
    // const mint = web3.Keypair.generate()

    // console.log('mint --', mint.publicKey)
    const ata = await web3.PublicKey.findProgramAddress(
      [
        getWeb3PublicKey(wallet.address!).toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        getWeb3PublicKey(
          '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        ).toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    )

    console.log('ataataata --', ata[0].toString())
  }
  async function transferSol() {
    const recentBlockhash = (
      await reactConnection.connection.getRecentBlockhash()
    ).blockhash
    const transaction = new Transaction({
      recentBlockhash,
      feePayer: phantomWallet.publicKey!,
    }).add(
      web3.SystemProgram.transfer({
        fromPubkey: phantomWallet.publicKey!,
        toPubkey: getWeb3PublicKey(
          '2BVJNrsJYmsMrQaid6EvjRdyk36Bm7erF16t8Tksm3WK',
        ),
        lamports: 1000000, // number of SOL to send
      }),
    )
    console.log('transaction -', transaction)
    const signature = await phantomWallet.sendTransaction(
      transaction,
      reactConnection.connection,
    )
    console.log('signature -', signature)
    await reactConnection.connection.confirmTransaction(signature)
  }
  async function createCustomToken() {
    try {
      // const keypair = web3.Keypair.generate()
      // const fromAirDropSignature =
      //   await reactConnection.connection.requestAirdrop(
      //     keypair.publicKey,
      //     web3.LAMPORTS_PER_SOL,
      //   )

      // await reactConnection.connection.confirmTransaction(fromAirDropSignature)

      const secretKey =
        '5tgSepu28hP18obJCELv8MXnvuqGRK4M1oq67V63zWZjreQD8MDu7B5gNc5H8gKGy6DzF72Ax5eZcrxBZPtjR2ub'

      const keypair = web3.Keypair.fromSecretKey(b58.decode(secretKey))

      const mint = await Token.createMint(
        reactConnection.connection,
        keypair,
        keypair.publicKey,
        keypair.publicKey,
        6,
        TOKEN_PROGRAM_ID,
      )

      console.log({ mint })

      const myToken = await mint.getOrCreateAssociatedAccountInfo(
        keypair.publicKey,
      )

      console.log({ myToken })

      console.log(
        'token public address: ' + myToken.address.toBase58(),
        myToken.address.toString(),
      )

      await mint.mintTo(
        myToken.address,
        keypair.publicKey,
        [],
        web3.LAMPORTS_PER_SOL,
      )

      console.log('done--')
    } catch (e: any) {
      console.error(e, e.data)
    }
  }
  async function getAssAccInfo() {
    const associatedTokenAccount = await getAtaForMint(
      '2BVJNrsJYmsMrQaid6EvjRdyk36Bm7erF16t8Tksm3WK',
      getWeb3PublicKey('5Kiym8uZRskM5y4nQ34htFRm1hvnAbmPyPtLFkW25FH3'),
    )
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain

    console.log(
      'associatedTokenAccount --',
      associatedTokenAccount[0].toString(),
    )
  }
  async function transferZyrianToken() {
    const secretKey =
      '5tgSepu28hP18obJCELv8MXnvuqGRK4M1oq67V63zWZjreQD8MDu7B5gNc5H8gKGy6DzF72Ax5eZcrxBZPtjR2ub'

    const keypair = web3.Keypair.fromSecretKey(b58.decode(secretKey))

    const toAssociatedAccount = await getAtaForMint(
      '2BVJNrsJYmsMrQaid6EvjRdyk36Bm7erF16t8Tksm3WK',
      getWeb3PublicKey('5Kiym8uZRskM5y4nQ34htFRm1hvnAbmPyPtLFkW25FH3'),
    )
    const fromAssociatedAccount = await getAtaForMint(
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      phantomWallet.publicKey?.toString()!,
      getWeb3PublicKey('5Kiym8uZRskM5y4nQ34htFRm1hvnAbmPyPtLFkW25FH3'),
    )

    const tx = new Transaction().add(
      Token.createTransferCheckedInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        fromAssociatedAccount[0], // from (should be a token account)
        getWeb3PublicKey('5Kiym8uZRskM5y4nQ34htFRm1hvnAbmPyPtLFkW25FH3'), // mint
        toAssociatedAccount[0], // to (should be a token account)
        phantomWallet.publicKey!, // owner of from
        [], // for multisig account, leave empty.
        1e6, // amount, if your deciamls is 8, send 10^8 for 1 token
        6, // decimals
      ),
    )

    const sig = await reactConnection.connection.sendTransaction(tx, [
      keypair,
      keypair,
    ])

    console.log('done', sig)

    // console.log(
    //   'associatedTokenAccount[0] -',
    //   associatedTokenAccount[0].toString(),
    // )

    // const sendTokenInstruction = Token.createTransferInstruction(
    //   TOKEN_PROGRAM_ID,
    //   getWeb3PublicKey('5Kiym8uZRskM5y4nQ34htFRm1hvnAbmPyPtLFkW25FH3'),
    //   associatedTokenAccount[0],
    //   fromAssociatedAccount[0],
    //   [],
    //   10000,
    // )

    // const recentBlockhash = (
    //   await reactConnection.connection.getRecentBlockhash()
    // ).blockhash

    // const txOpts = {
    //   recentBlockhash,
    //   // feePayer: fromAssociatedAccount[0],
    //   feePayer: phantomWallet.publicKey!,
    // }

    // const sendTokenTransaction = new Transaction(txOpts).add(
    //   sendTokenInstruction,
    // )

    // const signature = await sendAndConfirmTransaction(
    //   reactConnection.connection,
    //   sendTokenTransaction,
    //   [keypair],
    // )

    // const signature = await phantomWallet.sendTransaction(
    //   sendTokenTransaction,
    //   reactConnection.connection,
    // )

    // console.log('signature -', signature)
  }
  async function checkAnchor() {
    const provider = getProvider()
    const program = new Program(
      idl as Idl,
      new web3.PublicKey(idl.metadata.address),
      provider,
    )

    await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    })

    console.log('program.account -', program.account)
    // const account = await program.account.escrowAccount.fetch(
    //   new web3.PublicKey('HusrUj9LqBfsm13DKwFM4czWCUjEyWvagW8Gum6KbZpR'),
    // )

    // console.log('account =', account)
  }
  async function closeTokenAccount() {
    const tx = new Transaction().add(
      Token.createCloseAccountInstruction(
        TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
        new web3.PublicKey('73ycxRc6rkAHNqzrjbu956TtrsDi4jH9Ru4UTYaR8RR1'), // token account which you want to close
        baseAccount.publicKey, // destination
        baseAccount.publicKey, // owner of token account
        [], // for multisig
      ),
    )

    console.log(
      `txhash: ${await reactConnection.connection.sendTransaction(tx, [
        baseAccount,
        baseAccount /* fee payer + owner */,
      ])}`,
    )
  }

  return (
    <div className="app_container">
      <div className="gif-grid">
        <button onClick={transferSol}>Transfer SOL</button>
        <button onClick={createCustomToken}>Create Custom Token</button>
        <button onClick={getAssAccInfo}>Get SS</button>
        <button onClick={transferZyrianToken}>Send Zyrian</button>
        <button onClick={checkAnchor}>Check Account</button>
        <button onClick={closeTokenAccount}>Close Account</button>
      </div>
    </div>
  )
}

export default App
