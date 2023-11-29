import {
	Address,
	AnchorProvider,
	BN,
	Program,
	Wallet,
} from '@coral-xyz/anchor';
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
	getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
	Commitment,
	Connection,
	Keypair,
	PublicKey,
	SystemProgram,
} from '@solana/web3.js';
import wallet from '../wba-wallet.json';
import { IDL, WbaVault } from '../programs/wba_vault';

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = 'confirmed';

// Create a devnet connection
const connection = new Connection('https://api.devnet.solana.com');

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
	commitment,
});

// Create our program
const program = new Program<WbaVault>(
	IDL,
	'D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o' as Address,
	provider
);

// Create a random keypair
const vaultState = new PublicKey(
	'7ZLvbXVEnwrS7WknA8D2GW5pbHUzcRrhpicQPAAirxfA'
);

// Create the PDA for our enrollment account
// Seeds are "auth", vaultState
const vaultAuthKeys = [Buffer.from('auth'), vaultState.toBuffer()];
const [vaultAuth, _bump] = PublicKey.findProgramAddressSync(
	vaultAuthKeys,
	program.programId
);

// Create the vault key
// Seeds are "vault", vaultAuth
const vaultKeys = [Buffer.from('vault'), vaultAuth.toBuffer()];
const [_vault, _bump2] = PublicKey.findProgramAddressSync(
	vaultKeys,
	program.programId
);

const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey('63YCB6pwCj7VnVn3857KbeqPXevnTiHKBpQyuNysZFbE');

// Execute our enrollment transaction
(async () => {
	try {
		// Get the token account of the fromWallet address, and if it does not exist, create it
		const ownerAta = await getOrCreateAssociatedTokenAccount(
			connection,
			keypair,
			mint,
			keypair.publicKey,
			undefined,
			commitment
		);
		// Get the token account of the fromWallet address, and if it does not exist, create it
		const vaultAta = await getOrCreateAssociatedTokenAccount(
			connection,
			keypair,
			mint,
			vaultAuth,
			true,
			commitment
		);

		const signature = await program.methods
			.withdrawSpl(new BN(1n * token_decimals))
			.accounts({
				owner: keypair.publicKey,
				vaultState,
				vaultAuth,
				systemProgram: SystemProgram.programId,
				ownerAta: ownerAta.address,
				vaultAta: vaultAta.address,
				tokenMint: mint,
				tokenProgram: TOKEN_PROGRAM_ID,
				associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
			})
			.signers([keypair])
			.rpc();

		console.log(
			`Withdraw success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
		);

		// https://explorer.solana.com/tx/5ck83UzPvziHY7HzPX1dGnbXRimwUAqeG7rvydyL8Q5RdHaFo8r4omQwBneJayUdpAsaVKR2jEyxXkLcKec9E2Q9?cluster=devnet
	} catch (e) {
		console.error(`Oops, something went wrong: ${e}`);
	}
})();
