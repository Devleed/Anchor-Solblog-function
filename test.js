// const { u64 } = require("@solana/spl-token/lib/index.cjs");
// async function main() {
//   const {
//     SystemProgram,
//     Keypair,
//     Connection,
//     clusterApiUrl,
//     LAMPORTS_PER_SOL,
//     TransactionInstruction,
//     PublicKey,
//     Transaction,
//     sendAndConfirmTransaction,
//   } = require("@solana/web3.js");
//   let buffer = require("buffer");
//   const BN = require("bn.js");
//   const { serialize, deserialize, deserializeUnchecked } = require("borsh");
//   const {
//     Token,
//     TOKEN_PROGRAM_ID,
//     MintLayout,
//     AccountLayout,
//   } = require("@solana/spl-token");
//   const b58 = require("b58");
//   const connection = new Connection("http://127.0.0.1:8899", "confirmed");
//   //console.log(solanaWeb3);
//   //decrypt a b58 private key to an array of bytes and then to a keypair
//   let secretKey =
//     "2xNCt1bmfS8T77eLbK6EnZXKqHbiTUzVh3JAbR9NXRK13YfE3znTwN3KPLNHusgLEj9dUk5aTPXm3HTvwdnrdLS3";
//   let keypair = Keypair.fromSecretKey(b58.decode(secretKey));
//   // console.log(b58.encode(keypair.secretKey));
//   //convert a public key of keypair to base58 string
//   // console.log(keypair);
//   //get keypair from array of bytes
//   let pkBytes = await b58.decode(secretKey);
//   //console.log(keypair2);
//   let alice = Keypair.generate();
//   //console.log(b58.encode(alice.secretKey));
//   let bob = Keypair.generate();
//   //console.log(b58.encode(bob.secretKey));
//   //client = keypair
//   //first things first setup token accounts
//   //request lamports
//   let airdrop = await connection.requestAirdrop(
//     keypair.publicKey,
//     LAMPORTS_PER_SOL
//   );
//   //by airdropping sol am creating the account, account passed to systemprogram create account
//   //should not have sol
//   // let airdrop2 = await connection.requestAirdrop(alice.publicKey,LAMPORTS_PER_SOL);
//   // let airdrop3 = await connection.requestAirdrop(bob.publicKey,LAMPORTS_PER_SOL);
//   await connection.confirmTransaction(airdrop);
//   const space = 0;
//   const rentExemptAmount = await connection.getMinimumBalanceForRentExemption(
//     space
//   );
//   console.log(`need atleast ${rentExemptAmount}`);
//   const createAlice = {
//     /** The account that will transfer lamports to the created account */
//     fromPubkey: keypair.publicKey,
//     /** Public key of the created account */
//     newAccountPubkey: alice.publicKey,
//     /** Amount of lamports to transfer to the created account */
//     lamports: rentExemptAmount,
//     /** Amount of space in bytes to allocate to the created account */
//     space: space,
//     /** Public key of the program to assign as the owner of the created account */
//     programId: SystemProgram.programId,
//   };
//   const createBob = {
//     /** The account that will transfer lamports to the created account */
//     fromPubkey: keypair.publicKey,
//     /** Public key of the created account */
//     newAccountPubkey: bob.publicKey,
//     /** Amount of lamports to transfer to the created account */
//     lamports: rentExemptAmount,
//     /** Amount of space in bytes to allocate to the created account */
//     space: space,
//     /** Public key of the program to assign as the owner of the created account */
//     programId: SystemProgram.programId,
//   };
//   class Base {
//     constructor(properties) {
//       Object.keys(properties).map((key) => {
//         return (this[key] = properties[key]);
//       });
//     }
//   }
//   //making mint
//   const mintX = Keypair.generate();
//   // console.log(b58.encode(mintX.secretKey));
//   const mintY = Keypair.generate();
//   // console.log(b58.encode(mintY.secretKey));
//   let createMintX = {
//     /** The account that will transfer lamports to the created account */
//     fromPubkey: keypair.publicKey,
//     /** Public key of the created account */
//     newAccountPubkey: mintX.publicKey,
//     /** Amount of lamports to transfer to the created account */
//     lamports: await Token.getMinBalanceRentForExemptMint(connection),
//     /** Amount of space in bytes to allocate to the created account */
//     space: MintLayout.span,
//     /** Public key of the program to assign as the owner of the created account */
//     programId: TOKEN_PROGRAM_ID,
//   };
//   let createMintY = {
//     /** The account that will transfer lamports to the created account */
//     fromPubkey: keypair.publicKey,
//     /** Public key of the created account */
//     newAccountPubkey: mintY.publicKey,
//     /** Amount of lamports to transfer to the created account */
//     lamports: await Token.getMinBalanceRentForExemptMint(connection),
//     /** Amount of space in bytes to allocate to the created account */
//     space: MintLayout.span,
//     /** Public key of the program to assign as the owner of the created account */
//     programId: TOKEN_PROGRAM_ID,
//   };
//   //transaction where alice and bob are created
//   const createAliceIX = SystemProgram.createAccount(createAlice);
//   const createBobIX = SystemProgram.createAccount(createBob);
//   //instructions starting here
//   //creating mint accounts via system program and allocating space
//   let createMintXInstruction = SystemProgram.createAccount(createMintX);
//   let createMintYInstruction = SystemProgram.createAccount(createMintY);
//   //initing mint
//   //decimals 8 because 1 sol is 10^8 lamports/ 1 billion lamports
//   let initMintXInstruction = Token.createInitMintInstruction(
//     TOKEN_PROGRAM_ID,
//     mintX.publicKey,
//     9,
//     keypair.publicKey,
//     null
//   );
//   let initMintYInstruction = Token.createInitMintInstruction(
//     TOKEN_PROGRAM_ID,
//     mintY.publicKey,
//     9,
//     keypair.publicKey,
//     null
//   );
//   //create token accounts and then init them
//   let aliceMainTokenX = Keypair.generate();
//   let aliceTempTokenX = Keypair.generate();
//   let aliceMainTokenY = Keypair.generate();
//   let bobMainTokenX = Keypair.generate();
//   let bobMainTokenY = Keypair.generate();
//   let createAliceMainTokenX = {
//     /** The account that will transfer lamports to the created account */
//     fromPubkey: keypair.publicKey,
//     /** Public key of the created account */
//     newAccountPubkey: aliceMainTokenX.publicKey,
//     /** Amount of lamports to transfer to the created account */
//     lamports: await Token.getMinBalanceRentForExemptAccount(connection),
//     /** Amount of space in bytes to allocate to the created account */
//     space: AccountLayout.span,
//     /** Public key of the program to assign as the owner of the created account */
//     programId: TOKEN_PROGRAM_ID,
//   };
//   let createAliceTempTokenX = {
//     /** The account that will transfer lamports to the created account */
//     fromPubkey: keypair.publicKey,
//     /** Public key of the created account */
//     newAccountPubkey: aliceTempTokenX.publicKey,
//     /** Amount of lamports to transfer to the created account */
//     lamports: await Token.getMinBalanceRentForExemptAccount(connection),
//     /** Amount of space in bytes to allocate to the created account */
//     space: AccountLayout.span,
//     /** Public key of the program to assign as the owner of the created account */
//     programId: TOKEN_PROGRAM_ID,
//   };
//   let createAliceMainTokenY = {
//     /** The account that will transfer lamports to the created account */
//     fromPubkey: keypair.publicKey,
//     /** Public key of the created account */
//     newAccountPubkey: aliceMainTokenY.publicKey,
//     /** Amount of lamports to transfer to the created account */
//     lamports: await Token.getMinBalanceRentForExemptAccount(connection),
//     /** Amount of space in bytes to allocate to the created account */
//     space: AccountLayout.span,
//     /** Public key of the program to assign as the owner of the created account */
//     programId: TOKEN_PROGRAM_ID,
//   };
//   let createBobMainTokenX = {
//     /** The account that will transfer lamports to the created account */
//     fromPubkey: keypair.publicKey,
//     /** Public key of the created account */
//     newAccountPubkey: bobMainTokenX.publicKey,
//     /** Amount of lamports to transfer to the created account */
//     lamports: await Token.getMinBalanceRentForExemptAccount(connection),
//     /** Amount of space in bytes to allocate to the created account */
//     space: AccountLayout.span,
//     /** Public key of the program to assign as the owner of the created account */
//     programId: TOKEN_PROGRAM_ID,
//   };
//   let createBobMainTokenY = {
//     /** The account that will transfer lamports to the created account */
//     fromPubkey: keypair.publicKey,
//     /** Public key of the created account */
//     newAccountPubkey: bobMainTokenY.publicKey,
//     /** Amount of lamports to transfer to the created account */
//     lamports: await Token.getMinBalanceRentForExemptAccount(connection),
//     /** Amount of space in bytes to allocate to the created account */
//     space: AccountLayout.span,
//     /** Public key of the program to assign as the owner of the created account */
//     programId: TOKEN_PROGRAM_ID,
//   };
//   const createAliceMainTokenXIX = SystemProgram.createAccount(
//     createAliceMainTokenX
//   );
//   let aliceMainTokenAccInitX = Token.createInitAccountInstruction(
//     TOKEN_PROGRAM_ID,
//     mintX.publicKey,
//     aliceMainTokenX.publicKey,
//     alice.publicKey
//   );
//   let aliceTempTokenAccInitX = Token.createInitAccountInstruction(
//     TOKEN_PROGRAM_ID, //program id
//     mintX.publicKey, // mint public key
//     aliceTempTokenX.publicKey, // token account public key
//     alice.publicKey // owner public key
//   );
//   let aliceMainTokenAccInitY = Token.createInitAccountInstruction(
//     TOKEN_PROGRAM_ID,
//     mintY.publicKey,
//     aliceMainTokenY.publicKey,
//     alice.publicKey
//   );
//   let bobMainTokenAccInitX = Token.createInitAccountInstruction(
//     TOKEN_PROGRAM_ID,
//     mintX.publicKey,
//     bobMainTokenX.publicKey,
//     bob.publicKey
//   );
//   let bobMainTokenAccInitY = Token.createInitAccountInstruction(
//     TOKEN_PROGRAM_ID,
//     mintY.publicKey,
//     bobMainTokenY.publicKey,
//     bob.publicKey
//   );
//   //create alice account -> create bob account-> create mintx acc -> create minty acc-> init mintx-> init mintY->create alice
//   //main token accX-> create alice temp token accountX -> create alice y token acc-> create bob main token acc Y-> create bob main tokken acc X
//   let allTransactions = new Transaction();
//   allTransactions.add(
//     createAliceIX,
//     createBobIX,
//     createMintXInstruction,
//     createMintYInstruction,
//     initMintXInstruction,
//     initMintYInstruction,
//     createAliceMainTokenXIX,
//     // createAliceTempTokenXIX,
//     // createAliceMainTokenYIX,
//     aliceMainTokenAccInitX
//     // aliceTempTokenAccInitX,
//   );
//   let res = await sendAndConfirmTransaction(connection, allTransactions, [
//     keypair,
//     alice,
//     bob,
//     mintX,
//     mintY,
//     aliceMainTokenX,
//   ]);
//   //console.log(res);
//   let tokenAmount = await connection.getTokenAccountBalance(
//     aliceMainTokenX.publicKey
//   );
//   console.log("before minting");
//   console.log(`Alice balance is ${await tokenAmount.value.amount}`);
//   const createAliceTempTokenXIX = SystemProgram.createAccount(
//     createAliceTempTokenX
//   );
//   const createAliceMainTokenYIX = SystemProgram.createAccount(
//     createAliceMainTokenY
//   );
//   const createBobMainTokenXIX =
//     SystemProgram.createAccount(createBobMainTokenX);
//   const createBobMainTokenYIX =
//     SystemProgram.createAccount(createBobMainTokenY);
//   //mint token instruction
//   let mintTokenXIX = Token.createMintToInstruction(
//     TOKEN_PROGRAM_ID,
//     mintX.publicKey,
//     aliceMainTokenX.publicKey,
//     keypair.publicKey,
//     [],
//     50e8
//   );
//   let mintTokenYIX = Token.createMintToInstruction(
//     TOKEN_PROGRAM_ID,
//     mintY.publicKey,
//     bobMainTokenY.publicKey,
//     keypair.publicKey,
//     [],
//     50e8
//   );
//   //transfer tokens from alice to her temp account
//   let transferTokenIX = Token.createTransferInstruction(
//     TOKEN_PROGRAM_ID,
//     aliceMainTokenX.publicKey,
//     aliceTempTokenX.publicKey,
//     alice.publicKey,
//     [],
//     5e8
//   );
//   //
//   let secondTransaction = new Transaction();
//   secondTransaction.add(
//     createAliceTempTokenXIX,
//     createAliceMainTokenYIX,
//     createBobMainTokenXIX,
//     createBobMainTokenYIX,
//     aliceTempTokenAccInitX,
//     aliceMainTokenAccInitY,
//     bobMainTokenAccInitX,
//     bobMainTokenAccInitY,
//     mintTokenXIX,
//     mintTokenYIX,
//     transferTokenIX
//     // createEscrowAccountIX,
//   );
//   // it requires not all accounts the instruction refers but all the signers those instructions refer
//   await sendAndConfirmTransaction(connection, secondTransaction, [
//     keypair,
//     aliceTempTokenX,
//     aliceMainTokenY,
//     bobMainTokenX,
//     bobMainTokenY,
//     alice,
//     // escrowAccount
//     // mintX,
//     //  mintY,
//     //  alice,
//     //  bob,
//   ]);
//   let tokenAmounts = await connection.getTokenAccountBalance(
//     aliceMainTokenX.publicKey
//   );
//   let tokenAmountss = await connection.getTokenAccountBalance(
//     bobMainTokenY.publicKey
//   );
//   console.log("After Creation and instruction");
//   console.log(`Alice X balance is ${await tokenAmounts.value.amount}`);

const input = `3 4
1 2 1 10
3 2 3 4
1 3 3 2`

function main(input) {
  // * Parsing Input
  let menus = input.split('\n').map(x => x.split(' '))

  const [numberOfMenus, numberOfItems] = menus[0]

  // * Remove number of menus and number of items
  menus.splice(0, 1)

  // * empty points object
  let points = {}

  for (let i = 0; i < numberOfItems; i++) {
    let currentMax = 0
    let currentMaxIndex = null

    for (let menuIndex in menus) {
      menuIndex = Number(menuIndex)

      if (Number(menus[menuIndex][i] || 0) > currentMax) {
        currentMax = Number(menus[menuIndex][i])
        currentMaxIndex = menuIndex
      }

      console.log({ currentMax, currentMaxIndex })

      if (menuIndex === menus.length - 1 && currentMaxIndex && currentMax) {
        // last iteration
        points[currentMaxIndex] = points[currentMaxIndex]
          ? points[currentMaxIndex] + 1
          : 1
      }
    }
  }

  const maxPoints = Math.max(...Object.values(points))
  const sameMaxPoints = Object.keys(points).filter(
    point => points[point] === maxPoints,
  )

  if (sameMaxPoints.length > 1) {
    let maxAverage = 0
    let maxAverageIndex = null
    for (let menu of sameMaxPoints) {
      const res = menus[menu].reduce((acc, cur) => {
        return acc + Number(cur)
      }, 0)

      if (res > maxAverage) {
        maxAverage = res
        maxAverageIndex = menu
      }
    }

    console.log((Number(maxAverageIndex) + 1).toString())
    return
  }

  const winner = Object.keys(points).find(point => points[point] === maxPoints)

  console.log((Number(winner) + 1).toString())
}

main(input)

// ! OLD SOLUTION
// function main(input) {
//   const abc = input.split('\n').map(x => x.split(' '))

//   let points = {}
//   const maxArrLength = Math.max(...abc.map(x => x.length))

//   for (let i = 0; i < maxArrLength; i++) {
//     let currentMax = 0
//     let currentMaxIndex = null

//     for (let menuIndex in abc) {
//       if (abc[menuIndex].length < maxArrLength) {
//         continue
//       }
//       menuIndex = Number(menuIndex)

//       if (Number(abc[menuIndex][i] || 0) > currentMax) {
//         currentMax = Number(abc[menuIndex][i])
//         currentMaxIndex = menuIndex
//       }

//       if (menuIndex === abc.length - 1 && currentMaxIndex && currentMax) {
//         // last iteration
//         points[currentMaxIndex] = points[currentMaxIndex]
//           ? points[currentMaxIndex] + 1
//           : 1
//       }
//     }
//   }

//   const maxPoints = Math.max(...Object.values(points))
//   const sameMaxPoints = Object.keys(points).filter(
//     point => points[point] === maxPoints,
//   )

//   if (sameMaxPoints.length) {
//     let maxAverage = 0
//     let maxAverageIndex = null
//     for (let menu of sameMaxPoints) {
//       const res = abc[menu].reduce((acc, cur) => {
//         return acc + Number(cur)
//       }, 0)

//       if (res > maxAverage) {
//         maxAverage = res
//         maxAverageIndex = menu
//       }
//     }

//     console.log(maxAverageIndex)
//     return
//   }

//   const winner = Object.keys(points).find(point => points[point] === maxPoints)

//   console.log(winner)
// }
