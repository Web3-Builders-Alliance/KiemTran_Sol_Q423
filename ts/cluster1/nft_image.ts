import wallet from '../wba-wallet.json';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
	createGenericFile,
	createSignerFromKeypair,
	signerIdentity,
} from '@metaplex-foundation/umi';
import { createBundlrUploader } from '@metaplex-foundation/umi-uploader-bundlr';
import { readFile } from 'fs/promises';

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');
const bundlrUploader = createBundlrUploader(umi);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
	try {
    let file = await readFile("images/generug-0.png");
		const image = createGenericFile(file, "Generug", {
      contentType: "image/png",
    });
    const [myUri] = await bundlrUploader.upload([image]);
    console.log("Your image URI: ", myUri);
    // Your image URI:  https://arweave.net/Ic0GZGDo49L9tqwANsy0_stJ1yOsJmOkDRfAmpBGR-4
	} catch (error) {
		console.log('Oops.. Something went wrong', error);
	}
})();
