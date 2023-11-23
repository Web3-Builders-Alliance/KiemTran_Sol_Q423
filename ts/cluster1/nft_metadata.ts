import wallet from '../wba-wallet.json';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
	createGenericFile,
	createSignerFromKeypair,
	signerIdentity,
} from '@metaplex-foundation/umi';
import { createBundlrUploader } from '@metaplex-foundation/umi-uploader-bundlr';

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');
const bundlrUploader = createBundlrUploader(umi);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
	try {
		// Follow this JSON structure
		// https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
		const image =
      "https://arweave.net/Ic0GZGDo49L9tqwANsy0_stJ1yOsJmOkDRfAmpBGR-4";
		const metadata = {
		    name: "Generug #1",
		    symbol: "RUG",
        description: "Stupid NFT",
		    image,
		    attributes: [
        {
          trait_type: "Background",
          value: "Pink",
        },
        {
          trait_type: "Rarity",
          value: "Low",
        },
      ],
		    properties: {
        files: [
          {
            type: "image/png",
            uri: image,
          },
        ],
      },
      creators: [],
		};
		const myUri = await bundlrUploader.uploadJson(metadata);
		console.log("Your image URI: ", myUri);
    // Your image URI:  https://arweave.net/oZdnw969_Zkrjfhvyk9_rgjAmDKf5K8RjiHFYiiBXXQ
	} catch (error) {
		console.log('Oops.. Something went wrong', error);
	}
})();
