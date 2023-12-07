use anchor_lang::prelude::*;
use anchor_spl::{token::{TokenAccount, Mint, Token, Transfer, transfer, CloseAccount, close_account}, associated_token::AssociatedToken};


use crate::{Escrow};

#[derive(Accounts)]
pub struct Take<'info> {
  #[account(mut)]
  taker: Signer<'info>,
  #[account(mut)]
  maker: SystemAccount<'info>,
  mint_a: Account<'info, Mint>,
  mint_b: Account<'info, Mint>,
  #[account(
    init_if_needed,
    payer = taker,
    associated_token::mint = mint_a,
    associated_token::authority = taker

  )]
  taker_ata_a: Account<'info, TokenAccount>,
  #[account(
    mut,
    associated_token::mint = mint_b,
    associated_token::authority = taker

  )]
  taker_ata_b: Account<'info, TokenAccount>,
  #[account(
    init_if_needed,
    payer = taker,
    associated_token::mint = mint_b,
    associated_token::authority = maker

  )]
  maker_ata_b: Account<'info, TokenAccount>,
  #[account(
    mut,
    close = maker,
    seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
    bump = escrow.bump,
    has_one = mint_a,
    has_one = mint_b
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

impl <'info> Take<'info> {
  pub fn deposit(&mut self) -> Result<()> {
    let accounts = Transfer {
      from: self.taker_ata_b.to_account_info(),
      to: self.maker_ata_b.to_account_info(),
      authority: self.taker.to_account_info()
    };

    let ctx = CpiContext::new(self.token_program.to_account_info(), accounts);

    transfer(ctx, self.escrow.receive)?;

    Ok(())
  }


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
      to: self.taker_ata_a.to_account_info(),
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
      destination: self.taker.to_account_info(),
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
