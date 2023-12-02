import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Vault } from '../target/types/vault';
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
} from '@solana/web3.js';
// @ts-ignore
import wallet from '../wba-wallet.json';

describe('vault', () => {
	// Configure the client to use the local cluster.
	const program = anchor.workspace.Vault as Program<Vault>;

	const connection = anchor.getProvider().connection;

	// const signer = Keypair.generate();
	const signer = Keypair.fromSecretKey(new Uint8Array(wallet));

	const vault = PublicKey.findProgramAddressSync(
		[Buffer.from('vault'), signer.publicKey.toBuffer()],
		program.programId
	)[0];

	const confirm = async (signature: string): Promise<string> => {
		const block = await connection.getLatestBlockhash();
		await connection.confirmTransaction({
			signature,
			...block,
		});
		return signature;
	};

	const log = async (signature: string): Promise<string> => {
		console.log(
			`Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
		);
		return signature;
	};

	it('Airdrop', async () => {
		await connection
			.requestAirdrop(signer.publicKey, LAMPORTS_PER_SOL * 10)
			.then(confirm)
			.then(log);
	});

	it('Deposit', async () => {
		const tx = await program.methods
			.deposit(new anchor.BN(LAMPORTS_PER_SOL * 1))
			.accounts({
				owner: signer.publicKey,
				vault: vault,
				systemProgram: SystemProgram.programId,
			})
			.signers([signer])
			.rpc()
			.then(confirm)
			.then(log);
	});

	it('Withdraw', async () => {
		const tx = await program.methods
			.withdraw(new anchor.BN(LAMPORTS_PER_SOL * 1))
			.accounts({
				owner: signer.publicKey,
				vault: vault,
				systemProgram: SystemProgram.programId,
			})
			.signers([signer])
			.rpc()
			.then(confirm)
			.then(log);
	});
});
