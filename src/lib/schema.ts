import { pgTable, text, timestamp, numeric, boolean, integer } from 'drizzle-orm/pg-core'

export const usuarios = pgTable('usuarios', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senha: text('senha').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const centrosCusto = pgTable('centros_custo', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  descricao: text('descricao'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const pagamentos = pgTable('pagamentos', {
  id: text('id').primaryKey(),
  conta: text('conta').notNull(),
  nome: text('nome').notNull(),
  valor: numeric('valor', { precision: 12, scale: 2 }).notNull(),
  vencimento: text('vencimento').notNull(),
  status: text('status').notNull().default('pendente'),
  obs: text('obs'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const uploads = pgTable('uploads', {
  id: text('id').primaryKey(),
  conta: text('conta').notNull(),
  nomeArquivo: text('nome_arquivo').notNull(),
  totalTransacoes: integer('total_transacoes').notNull(),
  inseridas: integer('inseridas').notNull(),
  duplicatas: integer('duplicatas').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const transacoes = pgTable('transacoes', {
  id: text('id').primaryKey(),
  fitid: text('fitid').notNull().unique(),
  conta: text('conta').notNull(),
  data: text('data').notNull(),
  valor: numeric('valor', { precision: 12, scale: 2 }).notNull(),
  memo: text('memo'),
  descricao: text('descricao'),
  centroCustoId: text('centro_custo_id').references(() => centrosCusto.id),
  uploadId: text('upload_id').references(() => uploads.id),
  conciliada: boolean('conciliada').default(false),
  futura: boolean('futura').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})