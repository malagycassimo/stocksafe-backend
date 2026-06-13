-- CreateTable
CREATE TABLE "LoteEstoque" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "codigo_lote" TEXT NOT NULL,
    "data_fabricacao" TIMESTAMP(3),
    "data_validade" TIMESTAMP(3) NOT NULL,
    "local_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "valor_unitario" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISPONIVEL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoteEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoteEstoque_produto_id_idx" ON "LoteEstoque"("produto_id");

-- CreateIndex
CREATE INDEX "LoteEstoque_local_id_idx" ON "LoteEstoque"("local_id");

-- CreateIndex
CREATE INDEX "LoteEstoque_data_validade_idx" ON "LoteEstoque"("data_validade");

-- CreateIndex
CREATE UNIQUE INDEX "LoteEstoque_produto_id_codigo_lote_local_id_key" ON "LoteEstoque"("produto_id", "codigo_lote", "local_id");

-- AddForeignKey
ALTER TABLE "LoteEstoque" ADD CONSTRAINT "LoteEstoque_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteEstoque" ADD CONSTRAINT "LoteEstoque_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "Local"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
