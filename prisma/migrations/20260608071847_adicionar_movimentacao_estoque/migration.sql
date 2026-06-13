-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "codigo_lote" TEXT,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "origem_id" TEXT,
    "destino_id" TEXT,
    "justificativa" TEXT,
    "usuario_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_produto_id_idx" ON "movimentacoes_estoque"("produto_id");
