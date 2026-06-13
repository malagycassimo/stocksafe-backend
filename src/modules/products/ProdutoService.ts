import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class ProdutoService {
    // ➕ CRIAR PRODUTO
    // async execute(dados: any) {
    //     // Validação de SKU único
    //     const produtoExiste = await prisma.produto.findUnique({
    //         where: { sku: dados.sku }
    //     });

    //     if (produtoExiste) {
    //         throw new AppError(`O SKU '${dados.sku}' já está registado noutro produto no StockSafe.`, 400);
    //     }

    //     return await prisma.produto.create({
    //         data: {
    //             sku: dados.sku,
    //             codigo_barras_interno: dados.codigo_barras_interno,
    //             descricao: dados.descricao,
    //             categoria: dados.categoria,
    //             unidade_medida: dados.unidade_medida,
    //             tamanho_embalagem: dados.tamanho_embalagem,
    //             marca: dados.marca,
    //             observacoes: dados.observacoes,
    //             status_ativo: dados.status_ativo ?? true,

    //             vida_util_dias: dados.vida_util_dias ?? 0,
    //             politica_expedicao: dados.politica_expedicao ?? "FEFO",
    //             tipo_controle_validade: dados.tipo_controle_validade ?? "PORCENTAGEM",
    //             validade_min_recebimento: dados.validade_min_recebimento ?? 70.0,
    //             validade_min_cliente_dias: dados.validade_min_cliente_dias ?? 0,
    //             alertas_habilitados: dados.alertas_habilitados ?? true,
    //             alertas_dias_config: dados.alertas_dias_config,
    //             alerta_personalizado_dias: dados.alerta_personalizado_dias ?? 0,

    //             controle_lote: dados.controle_lote ?? false,
    //             controle_numero_serie: dados.controle_numero_serie ?? false,
    //             ficha_tecnica_obrigatoria: dados.ficha_tecnica_obrigatoria ?? false,
    //             certificacoes_obrigatorias: dados.certificacoes_obrigatorias ?? false,
    //             dias_quarentena: dados.dias_quarentena ?? 0,

    //             condicao_temperatura: dados.condicao_temperatura ?? "Ambiente",
    //             condicao_umidade: dados.condicao_umidade ?? "Ambiente",
    //             restricoes_armazenagem: dados.restricoes_armazenagem,
    //             peso_unidade: dados.peso_unidade ?? 0.0,
    //             unidade_peso: dados.unidade_peso ?? "KG",
    //             comprimento_cm: dados.comprimento_cm ?? 0.0,
    //             largura_cm: dados.largura_cm ?? 0.0,
    //             altura_cm: dados.altura_cm ?? 0.0,
    //             empilhamento_maximo: dados.empilhamento_maximo ?? 0,
    //             tipo_palete: dados.tipo_palete ?? "Sem Palete",
    //             instrucoes_especiais: dados.instrucoes_especiais
    //         }
    //     });
    // }

    async execute(dados: any) {
        // 1. Se receber uma lista (Array) vinda do Insomnia
        if (Array.isArray(dados)) {
            const listaSymmetric = [];

            for (const item of dados) {
                // Validação rápida de SKU duplicado dentro do loop
                const produtoExiste = await prisma.produto.findUnique({
                    where: { sku: item.sku }
                });

                if (produtoExiste) {
                    throw new AppError(`O SKU '${item.sku}' já está registado noutro produto no StockSafe.`, 400);
                }

                // Mapeia e garante os fallbacks padrão idênticos ao teu modelo original
                listaSymmetric.push({
                    sku: item.sku,
                    codigo_barras_interno: item.codigo_barras_interno ?? null,
                    descricao: item.descricao,
                    categoria: item.categoria,
                    unidade_medida: item.unidade_medida ?? "UN",
                    tamanho_embalagem: item.tamanho_embalagem ?? null,
                    marca: item.marca ?? null,
                    observacoes: item.observacoes ?? null,
                    status_ativo: item.status_ativo ?? true,

                    vida_util_dias: item.vida_util_dias ?? 0,
                    politica_expedicao: item.politica_expedicao ?? "FEFO",
                    tipo_controle_validade: item.tipo_controle_validade ?? "PORCENTAGEM",
                    validade_min_recebimento: item.validade_min_recebimento ?? 70.0,
                    validade_min_cliente_dias: item.validade_min_cliente_dias ?? 0,
                    alertas_habilitados: item.alertas_habilitados ?? true,
                    alertas_dias_config: item.alertas_dias_config ?? null,
                    alerta_personalizado_dias: item.alerta_personalizado_dias ?? 0,

                    controle_lote: item.controle_lote ?? false,
                    controle_numero_serie: item.controle_numero_serie ?? false,
                    ficha_tecnica_obrigatoria: item.ficha_tecnica_obrigatoria ?? false,
                    certificacoes_obrigatorias: item.certificacoes_obrigatorias ?? false,
                    dias_quarentena: item.dias_quarentena ?? 0,

                    condicao_temperatura: item.condicao_temperatura ?? "Ambiente",
                    condicao_umidade: item.condicao_umidade ?? "Ambiente",
                    restricoes_armazenagem: item.restricoes_armazenagem ?? null,
                    peso_unidade: item.peso_unidade ?? 0.0,
                    unidade_peso: item.unidade_peso ?? "KG",
                    comprimento_cm: item.comprimento_cm ?? 0.0,
                    largura_cm: item.largura_cm ?? 0.0,
                    altura_cm: item.altura_cm ?? 0.0,
                    empilhamento_maximo: item.empilhamento_maximo ?? 0,
                    tipo_palete: item.tipo_palete ?? "Sem Palete",
                    instrucoes_especiais: item.instrucoes_especiais ?? null
                });
            }

            // Executa o insert em massa na base de dados
            await prisma.produto.createMany({
                data: listaSymmetric,
                skipDuplicates: true
            });

            return {
                message: `${listaSymmetric.length} produtos processados e cadastrados com sucesso!`
            };
        }

        // 2. Se receber apenas um objeto isolado (Fluxo original da tela do Next.js)
        const produtoExiste = await prisma.produto.findUnique({
            where: { sku: dados.sku }
        });

        if (produtoExiste) {
            throw new AppError(`O SKU '${dados.sku}' já está registado noutro produto no StockSafe.`, 400);
        }

        return await prisma.produto.create({
            data: {
                sku: dados.sku,
                codigo_barras_interno: dados.codigo_barras_interno,
                descricao: dados.descricao,
                categoria: dados.categoria,
                unidade_medida: dados.unidade_medida,
                tamanho_embalagem: dados.tamanho_embalagem,
                marca: dados.marca,
                observacoes: dados.observacoes,
                status_ativo: dados.status_ativo ?? true,

                vida_util_dias: dados.vida_util_dias ?? 0,
                politica_expedicao: dados.politica_expedicao ?? "FEFO",
                tipo_controle_validade: dados.tipo_controle_validade ?? "PORCENTAGEM",
                validade_min_recebimento: dados.validade_min_recebimento ?? 70.0,
                validade_min_cliente_dias: dados.validade_min_cliente_dias ?? 0,
                alertas_habilitados: dados.alertas_habilitados ?? true,
                alertas_dias_config: dados.alertas_dias_config,
                alerta_personalizado_dias: dados.alerta_personalizado_dias ?? 0,

                controle_lote: dados.controle_lote ?? false,
                controle_numero_serie: dados.controle_numero_serie ?? false,
                ficha_tecnica_obrigatoria: dados.ficha_tecnica_obrigatoria ?? false,
                certificacoes_obrigatorias: dados.certificacoes_obrigatorias ?? false,
                dias_quarentena: dados.dias_quarentena ?? 0,

                condicao_temperatura: dados.condicao_temperatura ?? "Ambiente",
                condicao_umidade: dados.condicao_umidade ?? "Ambiente",
                restricoes_armazenagem: dados.restricoes_armazenagem,
                peso_unidade: dados.peso_unidade ?? 0.0,
                unidade_peso: dados.unidade_peso ?? "KG",
                comprimento_cm: dados.comprimento_cm ?? 0.0,
                largura_cm: dados.largura_cm ?? 0.0,
                altura_cm: dados.altura_cm ?? 0.0,
                empilhamento_maximo: dados.empilhamento_maximo ?? 0,
                tipo_palete: dados.tipo_palete ?? "Sem Palete",
                instrucoes_especiais: dados.instrucoes_especiais
            }
        });
    }

    // 🔍 LISTAR TODOS
    async listAll() {
        return await prisma.produto.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    // 🔍 BUSCAR POR ID
    async findById(id: string) {
        const produto = await prisma.produto.findUnique({ where: { id } });
        if (!produto) throw new AppError('Produto não encontrado no sistema.', 404);
        return produto;
    }

    // 🔄 ATUALIZAR (Campos Flexíveis/Opcionais via partial)
    async update(id: string, dados: any) {
        const produto = await prisma.produto.findUnique({ where: { id } });
        if (!produto) throw new AppError('Produto não encontrado no sistema.', 404);

        if (dados.sku && dados.sku !== produto.sku) {
            const skuEmUso = await prisma.produto.findUnique({ where: { sku: dados.sku } });
            if (skuEmUso) throw new AppError(`O SKU '${dados.sku}' já está a ser usado por outro produto.`, 400);
        }

        return await prisma.produto.update({
            where: { id },
            data: dados
        });
    }

    // ❌ ELIMINAR
    async delete(id: string) {
        const produto = await prisma.produto.findUnique({ where: { id } });
        if (!produto) throw new AppError('Produto não encontrado no sistema.', 404);

        await prisma.produto.delete({ where: { id } });
        return { message: 'Produto removido com sucesso do inventário.' };
    }
}