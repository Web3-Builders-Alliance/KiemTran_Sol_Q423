import { Address, AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Commitment, Connection, Keypair, PublicKey } from '@solana/web3.js';
import wallet from '../wba-wallet.json';
import { IDL, WbaVault } from '../programs/wba_vault';
/// J8qKEmQpadFeBuXAVseH8GNrvsyBhMT8MHSVD3enRgJz

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
const vaultState = Keypair.generate();
console.log(`Vault public key: ${vaultState.publicKey.toBase58()}`);
// Vault public key: 7ZLvbXVEnwrS7WknA8D2GW5pbHUzcRrhpicQPAAirxfA

// Create the PDA for our enrollment account
// Seeds are "auth", vaultState
const vaultAuth = [Buffer.from('auth'), vaultState.publicKey.toBuffer()];
const [vaultAuthKey, _bump] = PublicKey.findProgramAddressSync(
	vaultAuth,
	program.programId
);

// Create the vault key
// Seeds are "vault", vaultAuth
const vault = [Buffer.from('vault'), vaultAuthKey.toBuffer()];
const [vaultKey, _bump2] = PublicKey.findProgramAddressSync(
	vault,
	program.programId
);

// Execute our enrollment transaction
(async () => {
	try {
		const signature = await program.methods
			.initialize()
			.accounts({
				owner: keypair.publicKey,
				vault: vaultKey,
				vaultState: vaultState.publicKey,
				vaultAuth: vaultAuthKey,
				systemProgram: PublicKey.default,
			})
			.signers([keypair, vaultState])
			.rpc();
		console.log(
			`Init success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
		);

		// https://explorer.solana.com/tx/4tEGsgT15Tzf1iWSVYu8YHLGyzm62eDttT9Qczr9JpSiGebYuuxArDKBYwubiDd8rw2z8rnCEKp62b9t5dRnSsnT?cluster=devnet
	} catch (e) {
		console.error(`Oops, something went wrong: ${e}`);
	}
})();
