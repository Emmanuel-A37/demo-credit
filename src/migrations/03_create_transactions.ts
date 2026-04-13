import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('transactions', (table) => {
        table.uuid('id').primary();
        table.string('reference', 100).notNullable().unique();
        table.uuid('wallet_id').notNullable().references('id').inTable('wallets');
        table.uuid('counterparty_wallet_id').nullable();
        table.enu('type', ['fund', 'transfer', 'withdraw']).notNullable();
        table.enu('direction', ['credit', 'debit']).notNullable();
        table.decimal('amount', 15, 2).notNullable();
        table.enu('status', ['success', 'failed']).notNullable().defaultTo('success');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('transactions');
}