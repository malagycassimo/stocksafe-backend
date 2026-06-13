import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class FornecedorService {
    // ➕ CRIAR FORNECEDOR
    async execute(dados: any) {
        if (Array.isArray(dados)) {
            const result = [];
            for (const item of dados) {
                const fornecedorExiste = await prisma.fornecedor.findUnique({
                    where: { nuit: item.nuit }
                });

                if (fornecedorExiste) {
                    throw new AppError(`O NUIT '${item.nuit}' já está registado para outro fornecedor no StockSafe.`, 400);
                }

                const criado = await prisma.fornecedor.create({
                    data: {
                        razao_social: item.razao_social,
                        nome_fantasia: item.nome_fantasia,
                        nuit: item.nuit,
                        tipo_pessoa: item.tipo_pessoa ?? "JURIDICA",
                        email_principal: item.email_principal,
                        email_secundario: item.email_secundario,
                        telefone_principal: item.telefone_principal,
                        telefone_secundario: item.telefone_secundario,
                        website: item.website,
                        cobrança_rua: item.cobrança_rua,
                        cobrança_numero: item.cobrança_numero,
                        cobrança_complemento: item.cobrança_complemento,
                        cobrança_bairro: item.cobrança_bairro,
                        cobrança_cidade: item.cobrança_cidade,
                        cobrança_provincia: item.cobrança_provincia,
                        cobrança_cep: item.cobrança_cep,
                        cobrança_pais: item.cobrança_pais ?? "Moçambique",
                        mesmo_endereco: item.mesmo_endereco ?? true,
                        entrega_rua: item.entrega_rua,
                        entrega_numero: item.entrega_numero,
                        entrega_complemento: item.entrega_complemento,
                        entrega_bairro: item.entrega_bairro,
                        entrega_cidade: item.entrega_cidade,
                        entrega_provincia: item.entrega_provincia,
                        entrega_cep: item.entrega_cep,
                        entrega_pais: item.entrega_pais ?? "Moçambique",
                        status_ativo: item.status_ativo ?? true,
                        situacao: item.situacao ?? "Normal",

                        // Aba 2: Documentos
                        cert_iso9001: item.cert_iso9001 ?? false,
                        cert_iso22000: item.cert_iso22000 ?? false,
                        cert_haccp: item.cert_haccp ?? false,
                        cert_organico: item.cert_organico ?? false,
                        cert_kosher: item.cert_kosher ?? false,
                        cert_halal: item.cert_halal ?? false,
                        cert_outras: item.cert_outras ?? false,

                        // Aba 3: Condições Comerciais & SLAs
                        incoterm: item.incoterm ?? "EXW",
                        prazo_pagamento_dias: item.prazo_pagamento_dias ?? 30,
                        moeda: item.moeda ?? "MZN",
                        desconto_porcentagem: item.desconto_porcentagem ?? 0.0,
                        prazo_entrega_dias: item.prazo_entrega_dias ?? 0,
                        formas_pagamento: item.formas_pagamento,
                        valor_minimo_pedido: item.valor_minimo_pedido ?? 0.0,
                        valor_maximo_credito: item.valor_maximo_credito ?? 0.0,
                        sla_resposta_cotacao_h: item.sla_resposta_cotacao_h ?? 24,
                        sla_validade_lote_h: item.sla_validade_lote_h ?? 48,
                        sla_lead_time_dias: item.sla_lead_time_dias ?? 0,
                        categorias_fornecidas: item.categorias_fornecidas,
                        obs_categorias: item.obs_categorias
                    }
                });
                result.push(criado);
            }
            return {
                message: `${result.length} fornecedores cadastrados com sucesso!`,
                dados: result
            };
        }

        const fornecedorExiste = await prisma.fornecedor.findUnique({
            where: { nuit: dados.nuit }
        });

        if (fornecedorExiste) {
            throw new AppError(`O NUIT '${dados.nuit}' já está registado para outro fornecedor no StockSafe.`, 400);
        }

        return await prisma.fornecedor.create({
            data: {
                razao_social: dados.razao_social,
                nome_fantasia: dados.nome_fantasia,
                nuit: dados.nuit,
                tipo_pessoa: dados.tipo_pessoa ?? "JURIDICA",
                email_principal: dados.email_principal,
                email_secundario: dados.email_secundario,
                telefone_principal: dados.telefone_principal,
                telefone_secundario: dados.telefone_secundario,
                website: dados.website,
                cobrança_rua: dados.cobrança_rua,
                cobrança_numero: dados.cobrança_numero,
                cobrança_complemento: dados.cobrança_complemento,
                cobrança_bairro: dados.cobrança_bairro,
                cobrança_cidade: dados.cobrança_cidade,
                cobrança_provincia: dados.cobrança_provincia,
                cobrança_cep: dados.cobrança_cep,
                cobrança_pais: dados.cobrança_pais ?? "Moçambique",
                mesmo_endereco: dados.mesmo_endereco ?? true,
                entrega_rua: dados.entrega_rua,
                entrega_numero: dados.entrega_numero,
                entrega_complemento: dados.entrega_complemento,
                entrega_bairro: dados.entrega_bairro,
                entrega_cidade: dados.entrega_cidade,
                entrega_provincia: dados.entrega_provincia,
                entrega_cep: dados.entrega_cep,
                entrega_pais: dados.entrega_pais ?? "Moçambique",
                status_ativo: dados.status_ativo ?? true,
                situacao: dados.situacao ?? "Normal",

                // Aba 2: Documentos
                cert_iso9001: dados.cert_iso9001 ?? false,
                cert_iso22000: dados.cert_iso22000 ?? false,
                cert_haccp: dados.cert_haccp ?? false,
                cert_organico: dados.cert_organico ?? false,
                cert_kosher: dados.cert_kosher ?? false,
                cert_halal: dados.cert_halal ?? false,
                cert_outras: dados.cert_outras ?? false,

                // Aba 3: Condições Comerciais & SLAs
                incoterm: dados.incoterm ?? "EXW",
                prazo_pagamento_dias: dados.prazo_pagamento_dias ?? 30,
                moeda: dados.moeda ?? "MZN",
                desconto_porcentagem: dados.desconto_porcentagem ?? 0.0,
                prazo_entrega_dias: dados.prazo_entrega_dias ?? 0,
                formas_pagamento: dados.formas_pagamento,
                valor_minimo_pedido: dados.valor_minimo_pedido ?? 0.0,
                valor_maximo_credito: dados.valor_maximo_credito ?? 0.0,
                sla_resposta_cotacao_h: dados.sla_resposta_cotacao_h ?? 24,
                sla_validade_lote_h: dados.sla_validade_lote_h ?? 48,
                sla_lead_time_dias: dados.sla_lead_time_dias ?? 0,
                categorias_fornecidas: dados.categorias_fornecidas,
                obs_categorias: dados.obs_categorias
            }
        });
    }

    // 🔍 LISTAR TODOS
    async listAll() {
        return await prisma.fornecedor.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    // 🔍 BUSCAR POR ID
    async findById(id: string) {
        const fornecedor = await prisma.fornecedor.findUnique({ where: { id } });
        if (!fornecedor) throw new AppError('Fornecedor não encontrado no sistema.', 404);
        return fornecedor;
    }

    // 🔄 ATUALIZAR (Campos Dinâmicos via partial)
    async update(id: string, dados: any) {
        const fornecedor = await prisma.fornecedor.findUnique({ where: { id } });
        if (!fornecedor) throw new AppError('Fornecedor não encontrado no sistema.', 404);

        if (dados.nuit && dados.nuit !== fornecedor.nuit) {
            const nuitEmUso = await prisma.fornecedor.findUnique({ where: { nuit: dados.nuit } });
            if (nuitEmUso) throw new AppError(`O NUIT '${dados.nuit}' já está registado noutro fornecedor.`, 400);
        }

        return await prisma.fornecedor.update({
            where: { id },
            data: dados
        });
    }

    // ❌ ELIMINAR
    async delete(id: string) {
        const fornecedor = await prisma.fornecedor.findUnique({ where: { id } });
        if (!fornecedor) throw new AppError('Fornecedor não encontrado no sistema.', 404);

        await prisma.fornecedor.delete({ where: { id } });
        return { message: 'Fornecedor removido com sucesso do sistema.' };
    }
}