-- CreateTable
CREATE TABLE "Requisicao" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "solicitante_nome" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "centro_custo" TEXT NOT NULL,
    "date_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_necessaria" TIMESTAMP(3),
    "prioridade" TEXT NOT NULL DEFAULT 'NORMAL',
    "justificativa" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "justificativa_negacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requisicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequisicaoItem" (
    "id" TEXT NOT NULL,
    "requisicao_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "validade_min_proposta" DOUBLE PRECISION,
    "validade_min_tipo" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequisicaoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Requisicao_codigo_key" ON "Requisicao"("codigo");

-- CreateIndex
CREATE INDEX "Requisicao_usuario_id_idx" ON "Requisicao"("usuario_id");

-- CreateIndex
CREATE INDEX "RequisicaoItem_requisicao_id_idx" ON "RequisicaoItem"("requisicao_id");

-- CreateIndex
CREATE INDEX "RequisicaoItem_produto_id_idx" ON "RequisicaoItem"("produto_id");

-- AddForeignKey
ALTER TABLE "Requisicao" ADD CONSTRAINT "Requisicao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequisicaoItem" ADD CONSTRAINT "RequisicaoItem_requisicao_id_fkey" FOREIGN KEY ("requisicao_id") REFERENCES "Requisicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequisicaoItem" ADD CONSTRAINT "RequisicaoItem_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
