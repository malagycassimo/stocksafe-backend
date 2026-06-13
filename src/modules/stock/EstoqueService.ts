// import { prisma } from '../../lib/prisma.js';

// export class EstoqueService {
//     // 💡 Ajuste: Definido o retorno explícito como Promise<any[]> para limpar o compilador
//     async consultarEstoque(filtros: any): Promise<any[]> {
//         const now = new Date();

//         // 1. Construção dinâmica do filtro WHERE do Prisma
//         let whereClause: any = {};

//         if (filtros.status && filtros.status !== 'TODOS') {
//             whereClause.status = filtros.status;
//         }

//         if (filtros.search) {
//             whereClause.OR = [
//                 { codigo_lote: { contains: filtros.search, mode: 'insensitive' } },
//                 { produto: { sku: { contains: filtros.search, mode: 'insensitive' } } },
//                 { produto: { descricao: { contains: filtros.search, mode: 'insensitive' } } }
//             ];
//         }

//         // 💡 Ajuste: Adicionadas todas as faixas de validade da UI (15, 60 e maior que 60 dias)
//         if (filtros.faixa_validade && filtros.faixa_validade !== 'TODOS') {
//             const dataLimite = new Date();

//             if (filtros.faixa_validade === 'VENCIDOS') {
//                 whereClause.data_validade = { lt: now };
//             } else if (filtros.faixa_validade === '7_DIAS') {
//                 dataLimite.setDate(now.getDate() + 7);
//                 whereClause.data_validade = { gte: now, lte: dataLimite };
//             } else if (filtros.faixa_validade === '15_DIAS') {
//                 dataLimite.setDate(now.getDate() + 15);
//                 whereClause.data_validade = { gte: now, lte: dataLimite };
//             } else if (filtros.faixa_validade === '30_DIAS') {
//                 dataLimite.setDate(now.getDate() + 30);
//                 whereClause.data_validade = { gte: now, lte: dataLimite };
//             } else if (filtros.faixa_validade === '60_DIAS') {
//                 dataLimite.setDate(now.getDate() + 60);
//                 whereClause.data_validade = { gte: now, lte: dataLimite };
//             } else if (filtros.faixa_validade === 'MAIOR_60') {
//                 dataLimite.setDate(now.getDate() + 60);
//                 whereClause.data_validade = { gt: dataLimite };
//             }
//         }

//         // 2. Query na Base de Dados com o nome correto do modelo em camelCase
//         const lotes = await prisma.loteEstoque.findMany({
//             where: whereClause,
//             include: {
//                 produto: {
//                     select: { sku: true, descricao: true, unidade_medida: true }
//                 },
//                 local: {
//                     select: { id: true, codigo: true, nome: true, local_pai_id: true }
//                 }
//             }
//         });

//         // 3. Processamento dinâmico (O TypeScript infere o tipo de 'lote' automaticamente daqui)
//         return lotes.map(lote => {
//             const dataFab = lote.data_fabricacao ? new Date(lote.data_fabricacao) : new Date(lote.createdAt);
//             const dataVal = new Date(lote.data_validade);

//             const totalVida = dataVal.getTime() - dataFab.getTime();
//             const restante = dataVal.getTime() - now.getTime();

//             let percentagemVidaUtil = 0;
//             if (totalVida > 0 && restante > 0) {
//                 percentagemVidaUtil = Math.round((restante / totalVida) * 100);
//             }

//             const diasRestantes = Math.ceil(restante / (1000 * 60 * 60 * 24));

//             return {
//                 id: lote.id,
//                 produto: lote.produto,
//                 lote: lote.codigo_lote,
//                 validade: lote.data_validade,
//                 dias_restantes: diasRestantes,
//                 vencido: diasRestantes <= 0,
//                 percentagem_vida_util: Math.max(0, Math.min(100, percentagemVidaUtil)),
//                 quantidade: lote.quantidade,
//                 local_id: lote.local_id,
//                 local_codigo: lote.local.codigo,
//                 valor_unitario: lote.valor_unitario,
//                 valor_total: lote.quantidade * lote.valor_unitario,
//                 status: lote.status
//             };
//         });
//     }

//     // Método auxiliar para gerar os Cards de KPI do topo do ecrã
//     async obterMetricasPainel() {
//         const lotes = await prisma.loteEstoque.findMany();
//         const now = new Date();

//         let valorTotalEstoque = 0;
//         let totalItens = 0;
//         let vencidos = 0;
//         let criticos = 0; // Vence em <= 7 dias

//         lotes.forEach(l => {
//             valorTotalEstoque += l.quantidade * l.valor_unitario;
//             totalItens += l.quantidade;

//             const dias = Math.ceil((new Date(l.data_validade).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
//             if (dias <= 0) vencidos++;
//             else if (dias <= 7) criticos++;
//         });

//         return {
//             valor_total_estoque: valorTotalEstoque,
//             total_itens: totalItens,
//             alertas_criticos: { vencidos, menos_7_dias: criticos },
//             ocupacao_percentagem: 68
//         };
//     }




// }



import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class EstoqueService {
    // 🔍 CONSULTAR ESTOQUE (Com filtros dinâmicos da UI)
    async consultarEstoque(filtros: any): Promise<any[]> {
        const now = new Date();
        let whereClause: any = {};

        if (filtros.status && filtros.status !== 'TODOS') {
            whereClause.status = filtros.status;
        }

        if (filtros.search) {
            whereClause.OR = [
                { codigo_lote: { contains: filtros.search, mode: 'insensitive' } },
                { produto: { sku: { contains: filtros.search, mode: 'insensitive' } } },
                { produto: { descricao: { contains: filtros.search, mode: 'insensitive' } } }
            ];
        }

        if (filtros.faixa_validade && filtros.faixa_validade !== 'TODOS') {
            const dataLimite = new Date();

            if (filtros.faixa_validade === 'VENCIDOS') {
                whereClause.data_validade = { lt: now };
            } else if (filtros.faixa_validade === '7_DIAS') {
                dataLimite.setDate(now.getDate() + 7);
                whereClause.data_validade = { gte: now, lte: dataLimite };
            } else if (filtros.faixa_validade === '15_DIAS') {
                dataLimite.setDate(now.getDate() + 15);
                whereClause.data_validade = { gte: now, lte: dataLimite };
            } else if (filtros.faixa_validade === '30_DIAS') {
                dataLimite.setDate(now.getDate() + 30);
                whereClause.data_validade = { gte: now, lte: dataLimite };
            } else if (filtros.faixa_validade === '60_DIAS') {
                dataLimite.setDate(now.getDate() + 60);
                whereClause.data_validade = { gte: now, lte: dataLimite };
            } else if (filtros.faixa_validade === 'MAIOR_60') {
                dataLimite.setDate(now.getDate() + 60);
                whereClause.data_validade = { gt: dataLimite };
            }
        }

        const lotes = await prisma.loteEstoque.findMany({
            where: whereClause,
            include: {
                produto: {
                    select: { sku: true, descricao: true, unidade_medida: true }
                },
                local: {
                    select: { id: true, codigo: true, nome: true, local_pai_id: true }
                }
            }
        });

        return lotes.map(lote => {
            const dataFab = lote.data_fabricacao ? new Date(lote.data_fabricacao) : new Date(lote.createdAt);
            const dataVal = new Date(lote.data_validade);

            const totalVida = dataVal.getTime() - dataFab.getTime();
            const restante = dataVal.getTime() - now.getTime();

            let percentagemVidaUtil = 0;
            if (totalVida > 0 && restante > 0) {
                percentagemVidaUtil = Math.round((restante / totalVida) * 100);
            }

            const diasRestantes = Math.ceil(restante / (1000 * 60 * 60 * 24));

            return {
                id: lote.id,
                produto: lote.produto,
                lote: lote.codigo_lote,
                validade: lote.data_validade,
                dias_restantes: diasRestantes,
                vencido: diasRestantes <= 0,
                percentagem_vida_util: Math.max(0, Math.min(100, percentagemVidaUtil)),
                quantidade: lote.quantidade,
                local_id: lote.local_id,
                local_codigo: lote.local.codigo,
                valor_unitario: lote.valor_unitario,
                valor_total: lote.quantidade * lote.valor_unitario,
                status: lote.status
            };
        });
    }

    // 📊 METRICAS PAINEL (Cards de KPI do Topo)
    async obterMetricasPainel() {
        const lotes = await prisma.loteEstoque.findMany();
        const now = new Date();

        let valorTotalEstoque = 0;
        let totalItens = 0;
        let vencidos = 0;
        let criticos = 0;

        lotes.forEach(l => {
            valorTotalEstoque += l.quantidade * l.valor_unitario;
            totalItens += l.quantidade;

            const dias = Math.ceil((new Date(l.data_validade).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (dias <= 0) vencidos++;
            else if (dias <= 7) criticos++;
        });

        return {
            valor_total_estoque: valorTotalEstoque,
            total_itens: totalItens,
            alertas_criticos: { vencidos, menos_7_dias: criticos },
            ocupacao_percentagem: 68
        };
    }

    // 📥 ENTRADA DE STOCK (Recebimento / Upsert por Lote e Local)
    async registarEntrada(dados: any) {
        if (Array.isArray(dados)) {
            const result = [];
            for (const item of dados) {
                const res = await this.executarEntradaIndividual(item);
                result.push(res);
            }
            return result;
        }
        return await this.executarEntradaIndividual(dados);
    }

    private async executarEntradaIndividual(dados: any) {
        const { produto_id, codigo_lote, data_fabricacao, data_validade, local_id, quantidade, valor_unitario, usuario_id } = dados;

        const produto = await prisma.produto.findUnique({ where: { id: produto_id } });
        if (!produto) throw new AppError('Produto não cadastrado.', 404);

        const local = await prisma.local.findUnique({ where: { id: local_id } });
        if (!local) throw new AppError('Localização física não encontrada.', 404);

        const loteAtualizado = await prisma.loteEstoque.upsert({
            where: {
                produto_id_codigo_lote_local_id: { produto_id, codigo_lote, local_id }
            },
            update: {
                quantidade: { increment: quantidade }
            },
            create: {
                produto_id,
                codigo_lote,
                data_fabricacao: data_fabricacao ? new Date(data_fabricacao) : null,
                data_validade: new Date(data_validade),
                local_id,
                quantidade,
                valor_unitario,
                status: "DISPONIVEL"
            }
        });

        await prisma.movimentacaoEstoque.create({
            data: {
                produto_id,
                codigo_lote,
                tipo: 'ENTRADA',
                quantidade,
                destino_id: local_id,
                justificativa: 'Recebimento de mercadoria via sistema',
                usuario_id
            }
        });

        return loteAtualizado;
    }

    // 📤 SAÍDA INTELIGENTE VIA ALGORITMO FEFO
    async registarSaidaFEFO(dados: any) {
        if (Array.isArray(dados)) {
            const result = [];
            for (const item of dados) {
                const res = await this.executarSaidaIndividualFEFO(item);
                result.push(res);
            }
            return {
                message: `Saída em lote processada com sucesso.`,
                resultados: result
            };
        }
        return await this.executarSaidaIndividualFEFO(dados);
    }

    private async executarSaidaIndividualFEFO(dados: any) {
        const { produto_id, quantidade_solicitada, justificativa, usuario_id } = dados;
        let quantidadeRestante = quantidade_solicitada;

        const lotesDisponiveis = await prisma.loteEstoque.findMany({
            where: { produto_id, status: "DISPONIVEL", quantidade: { gt: 0 } },
            orderBy: { data_validade: 'asc' }
        });

        const stockTotal = lotesDisponiveis.reduce((acc, current) => acc + current.quantidade, 0);
        if (stockTotal < quantidade_solicitada) {
            throw new AppError(`Stock insuficiente. Solicitado: ${quantidade_solicitada}, Disponível: ${stockTotal}`, 400);
        }

        for (const lote of lotesDisponiveis) {
            if (quantidadeRestante <= 0) break;

            if (lote.quantidade >= quantidadeRestante) {
                await prisma.loteEstoque.update({
                    where: { id: lote.id },
                    data: { quantidade: lote.quantidade - quantidadeRestante }
                });
                quantidadeRestante = 0;
            } else {
                quantidadeRestante -= lote.quantidade;
                await prisma.loteEstoque.update({
                    where: { id: lote.id },
                    data: { quantidade: 0 }
                });
            }
        }

        await prisma.movimentacaoEstoque.create({
            data: {
                produto_id,
                tipo: 'SAIDA',
                quantidade: quantidade_solicitada,
                justificativa,
                usuario_id
            }
        });

        return { message: `Saída de ${quantidade_solicitada} unidades processada via FEFO.` };
    }
}