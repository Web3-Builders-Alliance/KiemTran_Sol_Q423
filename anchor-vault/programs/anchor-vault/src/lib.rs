use anchor_lang::prelude::*;

declare_id!("J6Fc9DF2SxEydxG7BZhB7CZybPxSTnfo27r6Z8RyVuJb");

#[program]
pub mod anchor_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
