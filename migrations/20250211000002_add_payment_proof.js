exports.up = function(knex) {
  return knex.schema.alterTable('event_registrations', function(table) {
    table.string('payment_proof_url').nullable();
    table.text('payment_notes').nullable();
    table.timestamp('payment_confirmed_at').nullable();
    table.integer('confirmed_by').unsigned().references('id').inTable('users').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('event_registrations', function(table) {
    table.dropColumn('payment_proof_url');
    table.dropColumn('payment_notes');
    table.dropColumn('payment_confirmed_at');
    table.dropColumn('confirmed_by');
  });
};
