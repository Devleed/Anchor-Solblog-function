/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useEffect, useState } from 'react'
import {
  useConnection,
  useWallet,
  useAnchorWallet,
} from '@solana/wallet-adapter-react'
import * as anchor from '@project-serum/anchor'
import { SystemProgram, Transaction } from '@solana/web3.js'

import idl from '../../idl.json'
import { BLOG_PROGRAM_ID } from '../../constant'

import './styles.scss'

type Props = Record<string, unknown>

interface UserData {
  address: string
  bio: string
  latestPost: string
}

const App: FC<Props> = () => {
  const [blogProgram, setBlogProgram] = useState<anchor.Program | null>(null)
  const [blogAccountPubkey, setBlogAccountPubkey] =
    useState<anchor.web3.PublicKey | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [bioValue, setBioValue] = useState<string>('')
  const [postValue, setPostValue] = useState<string>('')

  const { connection } = useConnection()
  const anchorWallet = useAnchorWallet()
  const wallet = useWallet()

  useEffect(() => {
    if (anchorWallet && wallet.connected) createBlogProgram()
  }, [anchorWallet, wallet])

  useEffect(() => {
    if (blogProgram) extractBlogAccountPublicKey()
  }, [blogProgram, anchorWallet])

  useEffect(() => {
    if (blogAccountPubkey) fetchUserData()
  }, [blogAccountPubkey])

  function createBlogProgram() {
    const provider = new anchor.Provider(connection, anchorWallet!, {
      preflightCommitment: 'recent',
    })

    // Address of the deployed program.
    const programId = new anchor.web3.PublicKey(BLOG_PROGRAM_ID)

    // Generate the program client from IDL.
    const program = new anchor.Program(idl as anchor.Idl, programId, provider)

    setBlogProgram(program)
  }
  async function extractBlogAccountPublicKey() {
    const allAssociatedAccounts = await blogProgram?.account.blogAccount.all()

    const pubkey = allAssociatedAccounts?.find(
      ({ account }) =>
        account.authority.toString() === anchorWallet?.publicKey.toString(),
    )?.publicKey

    setBlogAccountPubkey(pubkey || null)
  }
  async function initializeAccount() {
    if (!blogAccountPubkey) {
      try {
        const blogAccount = anchor.web3.Keypair.generate()
        const utf8EncodedBio = Buffer.from(bioValue || 'Hey there!')

        await blogProgram?.rpc.initialize(utf8EncodedBio, {
          // Pass in all the accounts needed
          accounts: {
            blogAccount: blogAccount.publicKey, // publickey for our new account
            authority: blogProgram.provider.wallet.publicKey, // publickey of our anchor wallet provider
            systemProgram: SystemProgram.programId, // just for Anchor reference
          },
          signers: [blogAccount], // blogAccount must sign this Tx, to prove we have the private key too
        })

        setBlogAccountPubkey(blogAccount.publicKey)
      } catch (error) {
        console.error(error)
      }
    } else alert('Account already initialized')
  }
  async function fetchUserData() {
    const encodedBio = await blogProgram?.account.blogAccount.fetch(
      blogAccountPubkey!,
    )

    new TextDecoder().decode(encodedBio?.bio)

    setUserData({
      address: blogAccountPubkey?.toString()!,
      bio: new TextDecoder().decode(encodedBio?.bio),
      latestPost: new TextDecoder().decode(encodedBio?.latestPost),
    })
  }
  async function makePost() {
    if (blogProgram && anchorWallet) {
      const utf8EncodedPost = Buffer.from(postValue)

      let tx: Transaction = blogProgram.transaction.makePost(utf8EncodedPost, {
        accounts: {
          blogAccount: blogAccountPubkey!,
          authority: blogProgram.provider.wallet.publicKey,
        },
      })

      tx = new Transaction({
        recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        feePayer: anchorWallet?.publicKey!,
      }).add(...tx.instructions!)

      const signedTx = await anchorWallet.signTransaction(tx)
      console.log('signedTx --', signedTx)

      const sentTx = await wallet.sendTransaction(signedTx!, connection)
      console.log('sentTx --', sentTx)
    }
  }

  return (
    <div className="app_container">
      <div className="gif-grid">Welcome To Blog App</div>
      {blogAccountPubkey ? (
        <p>
          Account initiazlized with public key {blogAccountPubkey.toString()}
        </p>
      ) : (
        <div>
          <input
            type="text"
            value={bioValue}
            onChange={e => setBioValue(e.target.value)}
          />
          <button onClick={initializeAccount}>Initialize Account</button>
        </div>
      )}

      {userData ? (
        <div>
          <h3>Owner: {userData.address}</h3>
          <h4>Bio: {userData.bio}</h4>
          <h5>Latest Post: {userData.latestPost}</h5>
        </div>
      ) : null}

      {userData ? (
        <div>
          <input
            type="text"
            value={postValue}
            onChange={e => setPostValue(e.target.value)}
          />
          <button onClick={makePost}>make post</button>
        </div>
      ) : null}
    </div>
  )
}

export default App
