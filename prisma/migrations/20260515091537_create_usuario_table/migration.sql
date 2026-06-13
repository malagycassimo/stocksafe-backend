-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REQUISITANTE', 'COMPRAS_PROCUREMENT', 'RECEBIMENTO_ARMAZEM', 'QUALIDADE_QA', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "departamento" TEXT,
    "cargo" TEXT,
    "perfil" "Role" NOT NULL DEFAULT 'REQUISITANTE',
    "forcarTrocaSenha" BOOLEAN NOT NULL DEFAULT false,
    "statusAtivo" BOOLEAN NOT NULL DEFAULT true,
    "notificaEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificaPush" BOOLEAN NOT NULL DEFAULT false,
    "permissoes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "codigo_barras_interno" TEXT,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "unidade_medida" TEXT NOT NULL,
    "tamanho_embalagem" TEXT,
    "marca" TEXT,
    "observacoes" TEXT,
    "status_ativo" BOOLEAN NOT NULL DEFAULT true,
    "vida_util_dias" INTEGER NOT NULL DEFAULT 0,
    "politica_expedicao" TEXT NOT NULL DEFAULT 'FEFO',
    "tipo_controle_validade" TEXT NOT NULL DEFAULT 'PORCENTAGEM',
    "validade_min_recebimento" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "validade_min_cliente_dias" INTEGER NOT NULL DEFAULT 0,
    "alertas_habilitados" BOOLEAN NOT NULL DEFAULT true,
    "alertas_dias_config" JSONB,
    "alerta_personalizado_dias" INTEGER NOT NULL DEFAULT 0,
    "controle_lote" BOOLEAN NOT NULL DEFAULT false,
    "controle_numero_serie" BOOLEAN NOT NULL DEFAULT false,
    "ficha_tecnica_obrigatoria" BOOLEAN NOT NULL DEFAULT false,
    "certificacoes_obrigatorias" BOOLEAN NOT NULL DEFAULT false,
    "dias_quarentena" INTEGER NOT NULL DEFAULT 0,
    "condicao_temperatura" TEXT NOT NULL DEFAULT 'Ambiente',
    "condicao_umidade" TEXT NOT NULL DEFAULT 'Ambiente',
    "restricoes_armazenagem" JSONB,
    "peso_unidade" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "unidade_peso" TEXT NOT NULL DEFAULT 'KG',
    "comprimento_cm" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "largura_cm" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "altura_cm" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "empilhamento_maximo" INTEGER NOT NULL DEFAULT 0,
    "tipo_palete" TEXT NOT NULL DEFAULT 'Sem Palete',
    "instrucoes_especiais" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "nuit" TEXT NOT NULL,
    "tipo_pessoa" TEXT NOT NULL DEFAULT 'JURIDICA',
    "email_principal" TEXT NOT NULL,
    "email_secundario" TEXT,
    "telefone_principal" TEXT NOT NULL,
    "telefone_secundario" TEXT,
    "website" TEXT,
    "cobrança_rua" TEXT NOT NULL,
    "cobrança_numero" TEXT,
    "cobrança_complemento" TEXT,
    "cobrança_bairro" TEXT NOT NULL,
    "cobrança_cidade" TEXT NOT NULL,
    "cobrança_provincia" TEXT NOT NULL,
    "cobrança_cep" TEXT,
    "cobrança_pais" TEXT NOT NULL DEFAULT 'Moçambique',
    "mesmo_endereco" BOOLEAN NOT NULL DEFAULT true,
    "entrega_rua" TEXT,
    "entrega_numero" TEXT,
    "entrega_complemento" TEXT,
    "entrega_bairro" TEXT,
    "entrega_cidade" TEXT,
    "entrega_provincia" TEXT,
    "entrega_cep" TEXT,
    "entrega_pais" TEXT DEFAULT 'Moçambique',
    "status_ativo" BOOLEAN NOT NULL DEFAULT true,
    "situacao" TEXT NOT NULL DEFAULT 'Normal',
    "cert_iso9001" BOOLEAN NOT NULL DEFAULT false,
    "cert_iso22000" BOOLEAN NOT NULL DEFAULT false,
    "cert_haccp" BOOLEAN NOT NULL DEFAULT false,
    "cert_organico" BOOLEAN NOT NULL DEFAULT false,
    "cert_kosher" BOOLEAN NOT NULL DEFAULT false,
    "cert_halal" BOOLEAN NOT NULL DEFAULT false,
    "cert_outras" BOOLEAN NOT NULL DEFAULT false,
    "incoterm" TEXT NOT NULL DEFAULT 'EXW',
    "prazo_pagamento_dias" INTEGER NOT NULL DEFAULT 30,
    "moeda" TEXT NOT NULL DEFAULT 'MZN',
    "desconto_porcentagem" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "prazo_entrega_dias" INTEGER NOT NULL DEFAULT 0,
    "formas_pagamento" JSONB,
    "valor_minimo_pedido" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "valor_maximo_credito" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "sla_resposta_cotacao_h" INTEGER NOT NULL DEFAULT 24,
    "sla_validade_lote_h" INTEGER NOT NULL DEFAULT 48,
    "sla_lead_time_dias" INTEGER NOT NULL DEFAULT 0,
    "categorias_fornecidas" JSONB,
    "obs_categorias" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Produto_sku_key" ON "Produto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_nuit_key" ON "Fornecedor"("nuit");
