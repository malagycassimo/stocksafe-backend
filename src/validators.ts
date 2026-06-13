
import { z } from 'zod';

// =========================================================================
// 👥 VALIDADOES DE USUÁRIO
// =========================================================================
export const createUsuarioSchema = z.object({
    nome_completo: z.string().min(3, { message: 'O nome_completo é obrigatório e deve ter no mínimo 3 caracteres.' }),
    email: z.string().min(1, { message: 'O email é obrigatório.' }).email('Formato de e-mail inválido.'),
    senha: z.string().min(6, { message: 'A senha é obrigatória e deve ter no mínimo 6 caracteres.' }),
    telefone: z.string().optional().nullable(),
    departamento: z.string().optional().nullable(),
    cargo: z.string().optional().nullable(),
    perfil: z.enum(['REQUISITANTE', 'COMPRAS_PROCUREMENT', 'RECEBIMENTO_ARMAZEM', 'QUALIDADE_QA', 'ADMIN']).default('REQUISITANTE'),
    forcar_troca_senha: z.boolean().default(false),
    status_ativo: z.boolean().default(true),
    notificacao_email: z.boolean().default(true),
    notificacao_push: z.boolean().default(false),
    permissoes: z.any().optional()
});

// =========================================================================
// 📦 VALIDAÇÕES DE PRODUTO (Sprint 1 - Core & Regras FEFO)
// =========================================================================
export const createProdutoSchema = z.object({
    // Aba 1: Geral
    sku: z.string().min(3, { message: 'O SKU é obrigatório e deve ter no mínimo 3 caracteres.' }),
    codigo_barras_interno: z.string().optional().nullable(),
    descricao: z.string().min(1, { message: 'A descrição é obrigatória.' }),
    categoria: z.string().min(1, { message: 'A categoria é obrigatória.' }),
    unidade_medida: z.string().min(1, { message: 'A unidade de medida é obrigatória.' }),
    tamanho_embalagem: z.string().optional().nullable(),
    marca: z.string().optional().nullable(),
    observacoes: z.string().optional().nullable(),
    status_ativo: z.boolean().default(true),

    // Aba 2: Requisitos de Validade & FEFO
    vida_util_dias: z.number().int().nonnegative().default(0),
    politica_expedicao: z.string().default('FEFO'),
    tipo_controle_validade: z.string().default('PORCENTAGEM'),
    validade_min_recebimento: z.number().min(0).max(100).default(70.0),
    validade_min_cliente_dias: z.number().int().nonnegative().default(0),
    alertas_habilitados: z.boolean().default(true),
    alertas_dias_config: z.any().optional().nullable(),
    alerta_personalizado_dias: z.number().int().nonnegative().default(0),

    // Aba 3: Rastreabilidade
    controle_lote: z.boolean().default(false),
    controle_numero_serie: z.boolean().default(false),
    ficha_tecnica_obrigatoria: z.boolean().default(false),
    certificacoes_obrigatorias: z.boolean().default(false),
    dias_quarentena: z.number().int().nonnegative().default(0),

    // Aba 4: Armazenagem
    condicao_temperatura: z.string().default('Ambiente'),
    condicao_umidade: z.string().default('Ambiente'),
    restricoes_armazenagem: z.any().optional().nullable(),
    peso_unidade: z.number().nonnegative().default(0.0),
    unidade_peso: z.string().default('KG'),
    comprimento_cm: z.number().nonnegative().default(0.0),
    largura_cm: z.number().nonnegative().default(0.0),
    altura_cm: z.number().nonnegative().default(0.0),
    empilhamento_maximo: z.number().int().nonnegative().default(0),
    tipo_palete: z.string().default('Sem Palete'),
    instrucoes_especiais: z.string().optional().nullable()
});

// =========================================================================
// 🤝 VALIDAÇÕES DE FORNECEDOR (Sprint 1)
// =========================================================================
export const createFornecedorSchema = z.object({
    // Aba 1: Geral
    razao_social: z.string().min(1, { message: 'A razão social é obrigatória.' }),
    nome_fantasia: z.string().optional().nullable(),
    nuit: z.string().min(9, { message: 'O NUIT é obrigatório e deve ter pelo menos 9 dígitos.' }),
    tipo_pessoa: z.string().default('JURIDICA'),
    email_principal: z.string().min(1, { message: 'O email principal é obrigatório.' }).email('Email inválido.'),
    email_secundario: z.string().optional().nullable(),
    telefone_principal: z.string().min(1, { message: 'O telefone principal é obrigatório.' }),
    telefone_secundario: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    cobrança_rua: z.string().min(1, { message: 'A rua de cobrança é obrigatória.' }),
    cobrança_numero: z.string().optional().nullable(),
    cobrança_complemento: z.string().optional().nullable(),
    cobrança_bairro: z.string().min(1, { message: 'O bairro de cobrança é obrigatório.' }),
    cobrança_cidade: z.string().min(1, { message: 'A cidade de cobrança é obrigatória.' }),
    cobrança_provincia: z.string().min(1, { message: 'A província de cobrança é obrigatória.' }),
    cobrança_cep: z.string().optional().nullable(),
    cobrança_pais: z.string().default('Moçambique'),
    mesmo_endereco: z.boolean().default(true),
    entrega_rua: z.string().optional().nullable(),
    entrega_numero: z.string().optional().nullable(),
    entrega_complemento: z.string().optional().nullable(),
    entrega_bairro: z.string().optional().nullable(),
    entrega_cidade: z.string().optional().nullable(),
    entrega_provincia: z.string().optional().nullable(),
    entrega_cep: z.string().optional().nullable(),
    entrega_pais: z.string().optional().nullable().default('Moçambique'),
    status_ativo: z.boolean().default(true),
    situacao: z.string().default('Normal'),

    // Aba 2: Documentos
    cert_iso9001: z.boolean().default(false),
    cert_iso22000: z.boolean().default(false),
    cert_haccp: z.boolean().default(false),
    cert_organico: z.boolean().default(false),
    cert_kosher: z.boolean().default(false),
    cert_halal: z.boolean().default(false),
    cert_outras: z.boolean().default(false),

    // Aba 3: Condições Comerciais & SLAs
    incoterm: z.string().default('EXW'),
    prazo_pagamento_dias: z.number().int().nonnegative().default(30),
    moeda: z.string().default('MZN'),
    desconto_porcentagem: z.number().min(0).max(100).default(0.0),
    prazo_entrega_dias: z.number().int().nonnegative().default(0),
    formas_pagamento: z.any().optional().nullable(),
    valor_minimo_pedido: z.number().nonnegative().default(0.0),
    valor_maximo_credito: z.number().nonnegative().default(0.0),
    sla_resposta_cotacao_h: z.number().int().nonnegative().default(24),
    sla_validade_lote_h: z.number().int().nonnegative().default(48),
    sla_lead_time_dias: z.number().int().nonnegative().default(0),
    categorias_fornecidas: z.any().optional().nullable(),
    obs_categorias: z.string().optional().nullable()
});




// =========================================================================
// 🤝 VALIDAÇÕES DE LOCAIS (Sprint 1)
// =========================================================================
export const createLocalSchema = z.object({
    codigo: z.string().min(1, 'O código do local é obrigatório.'),
    nome: z.string().min(1, 'O nome/descrição é obrigatório.'),
    tipo: z.enum(['ARMAZEM', 'ZONA', 'CORREDOR', 'PRATELEIRA', 'POSICAO']),

    temperatura_controlada: z.boolean().optional().default(false),
    humidade_controlada: z.boolean().optional().default(false),
    protegido_luz: z.boolean().optional().default(false),
    area_segregada: z.boolean().optional().default(false),
    quarentena: z.boolean().optional().default(false),
    bloqueado: z.boolean().optional().default(false),

    capacidade_maxima: z.number().int().nonnegative().optional().default(0),
    capacidade_atual: z.number().int().nonnegative().optional().default(0),

    local_pai_id: z.string().uuid().nullable().optional()
});




// =========================================================================
// 🤝 VALIDAÇÕES DE REQUISIÇÕES (Sprint 1)
// =========================================================================
export const createRequisicaoSchema = z.object({

    solicitante_nome: z.string().min(1, 'O nome do solicitante é obrigatório.'),
    departamento: z.string().min(1, 'O departamento é obrigatório.'),
    centro_custo: z.string().min(1, 'O centro de custo é obrigatório.'),
    date_necessaria: z.string().pipe(z.coerce.date()).optional(),
    prioridade: z.enum(['BAIXA', 'NORMAL', 'ALTA', 'URGENTE']).default('NORMAL'),
    justificativa: z.string().optional(),

    itens: z.array(
        z.object({
            produto_id: z.string().uuid('ID do produto inválido.'),
            quantidade: z.number().int().positive('A quantidade deve ser maior que zero.'),

            validade_min_proposta: z.number().nonnegative().optional(),
            validade_min_tipo: z.enum(['PERCENTAGEM', 'DIAS']).optional(),

            observacoes: z.string().optional()
        })
    ).min(1, 'A requisição deve conter pelo menos um item.')
});


export const analiseRequisicaoSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    justificativa_negacao: z.string().optional().transform(val => val ?? null)
}).refine(data => {
    if (data.status === 'REJECTED' && (!data.justificativa_negacao || data.justificativa_negacao.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: "É obrigatório introduzir uma justificativa ao rejeitar a requisição.",
    path: ["justificativa_negacao"]
});



export const estoqueQuerySchema = z.object({
    search: z.string().optional(),
    categoria: z.string().optional(),
    status: z.string().optional(),
    faixa_validade: z.enum(['TODOS', 'VENCIDOS', '7_DIAS', '15_DIAS', '30_DIAS', '60_DIAS', 'MAIOR_60']).optional()
});

// =========================================================================
// 🚀 ESQUEMAS EM MASSA (Bulk Schemas - Aceita objeto único ou array)
// =========================================================================
export const createProdutoBulkSchema = z.union([createProdutoSchema, z.array(createProdutoSchema)]);
export const createLocalBulkSchema = z.union([createLocalSchema, z.array(createLocalSchema)]);
export const createFornecedorBulkSchema = z.union([createFornecedorSchema, z.array(createFornecedorSchema)]);
export const createRequisicaoBulkSchema = z.union([createRequisicaoSchema, z.array(createRequisicaoSchema)]);