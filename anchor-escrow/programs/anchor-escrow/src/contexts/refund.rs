use anchor_lang::prelude::*;
use anchor_spl::{token::{TokenAccount, Mint, Token, Transfer, transfer, CloseAccount, close_account}, associated_token::AssociatedToken};

use crate::{Escrow};

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Refund<'info> {
  #[account(mut)]
  maker: Signer<'info>,
  mint_a: Account<'info, Mint>,
  #[account(
    mut,
    associated_token::mint = mint_a,
    associated_token::authority = maker

  )]
  maker_ata_a: Account<'info, TokenAccount>,
  #[account(
    mut,
    close = maker,
    seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
    bump = escrow.bump
  )]
  escrow: Account<'info, Escrow>,
  #[account(
    mut,
    seeds = [b"vault", escrow.key().as_ref()],
    bump = escrow.vault_bump,
    token::mint = mint_a,
    token::authority = escrow,
  )]
  vault: Account<'info, TokenAccount>,
  associated_token_program: Program<'info, AssociatedToken>,
  token_program: Program<'info, Token>,
  system_program: Program<'info, System>
}

impl<'info> Refund<'info> {
  pub fn withdraw_and_close_vault(&mut self) -> Result<()> {
    let binding_maker = self.maker.to_account_info().key();
    let binding_escrow = self.escrow.seed.to_le_bytes();
    let signer_seeds: [&[&[u8]];1] = [
      &[
        b"escrow",
        binding_maker.as_ref(),
        &binding_escrow.as_ref()[..],
        &[self.escrow.bump]
      ]
    ];

    let accounts = Transfer {
      from: self.vault.to_account_info(),
      to: self.maker_ata_a.to_account_info(),
      authority: self.escrow.to_account_info()
    };

    let ctx = CpiContext::new_with_signer(
      self.token_program.to_account_info(),
      accounts,
      &signer_seeds
    );

    transfer(ctx, self.vault.amount)?;

    let accounts = CloseAccount {
      account: self.vault.to_account_info(),
      destination: self.maker.to_account_info(),
      authority: self.escrow.to_account_info(),
    };

    let ctx = CpiContext::new_with_signer(
      self.token_program.to_account_info(),
      accounts,
      &signer_seeds
    );

    close_account(ctx)?;

    Ok(())
  }
}