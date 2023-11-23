import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
	createSignerFromKeypair,
	signerIdentity,
	generateSigner,
	percentAmount,
} from '@metaplex-foundation/umi';
import {
	createNft,
	mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';

import wallet from '../wba-wallet.json';
import base58 from 'bs58';

const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

const mint = generateSigner(umi);

(async () => {
	let tx = await createNft(umi, {
    mint,
    name: "Generug #1",
    uri: "https://arweave.net/oZdnw969_Zkrjfhvyk9_rgjAmDKf5K8RjiHFYiiBXXQ",
    sellerFeeBasisPoints: percentAmount(69),
    symbol: "RUG",
  });
	let result = await tx.sendAndConfirm(umi);
	const signature = base58.encode(result.signature);

	console.log(`Succesfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`)

	console.log('Mint Address: ', mint.publicKey);

  // Succesfully Minted! Check out your TX here:
  // https://explorer.solana.com/tx/3qbw1ksb5qBCaTRqWT3GtvoYcYG8zEbLiGb9doYrb7rQ55Ue8hP6keAZQ2dqW3G9x3wQEvqEDBxEGGyf74ZcYFdc?cluster=devnet
  // Mint Address:  HMoDub4Yb17q7MopaExASLerbQyNivaTeEhNZk1mwdSc
})();
