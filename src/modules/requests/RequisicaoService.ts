import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class RequisicaoService {
    async create(usuario_id: string, dados: any) {
        // Verificar se todos os produtos existem antes de criar a requisição
        const produtoIds: string[] = [];
        if (Array.isArray(dados)) {
            dados.forEach(item => {
                if (item.itens && Array.isArray(item.itens)) {
                    item.itens.forEach((subItem: any) => {
                        if (subItem.produto_id) produtoIds.push(subItem.produto_id);
                    });
                }
            });
        } else if (dados.itens && Array.isArray(dados.itens)) {
            dados.itens.forEach((item: any) => {
                if (item.produto_id) produtoIds.push(item.produto_id);
            });
        }

        if (produtoIds.length > 0) {
            const produtosExistentes = await prisma.produto.findMany({
                where: { id: { in: produtoIds } },
                select: { id: true }
            });
            const idsExistentes = new Set(produtosExistentes.map(p => p.id));
            const idsInexistentes = produtoIds.filter(id => !idsExistentes.has(id));

            if (idsInexistentes.length > 0) {
                throw new AppError(`Os seguintes IDs de produtos não existem no sistema: ${idsInexistentes.join(', ')}`, 400);
            }
        }

        if (Array.isArray(dados)) {
            const result = [];
            for (const item of dados) {
                const anoAtual = new Date().getFullYear();
                const codigoSeq = `RI-${anoAtual}-${Date.now().toString().slice(-3)}-${Math.floor(Math.random() * 1000)}`;

                const criado = await prisma.requisicao.create({
                    data: {
                        codigo: codigoSeq,
                        usuario_id,
                        solicitante_nome: item.solicitante_nome,
                        departamento: item.departamento,
                        centro_custo: item.centro_custo,
                        date_necessaria: item.date_necessaria ? new Date(item.date_necessaria) : null,
                        prioridade: item.prioridade,
                        justificativa: item.justificativa,
                        status: "PENDING",
                        itens: {
                            create: item.itens.map((subItem: any) => ({
                                produto_id: subItem.produto_id,
                                quantidade: subItem.quantidade,
                                validade_min_proposta: subItem.validade_min_proposta,
                                validade_min_tipo: subItem.validade_min_tipo,
                                observacoes: subItem.observacoes
                            }))
                        }
                    },
                    include: { itens: true }
                });
                result.push(criado);
            }
            return {
                message: `${result.length} requisições processadas e criadas com sucesso!`,
                dados: result
            };
        }

        // Gerador de código sequencial (Podes refinar isto depois com uma tabela de contadores)
        const anoAtual = new Date().getFullYear();
        const codigoSeq = `RI-${anoAtual}-${Date.now().toString().slice(-3)}`;

        // Cria a Requisição e os Itens numa transação única
        return await prisma.requisicao.create({
            data: {
                codigo: codigoSeq,
                usuario_id,
                solicitante_nome: dados.solicitante_nome,
                departamento: dados.departamento,
                centro_custo: dados.centro_custo,
                date_necessaria: dados.date_necessaria ? new Date(dados.date_necessaria) : null,
                prioridade: dados.prioridade,
                justificativa: dados.justificativa,
                status: "PENDING",
                itens: {
                    create: dados.itens.map((item: any) => ({
                        produto_id: item.produto_id,
                        quantidade: item.quantidade,
                        validade_min_proposta: item.validade_min_proposta,
                        validade_min_tipo: item.validade_min_tipo,
                        observacoes: item.observacoes
                    }))
                }
            },
            include: { itens: true }
        });
    }

    // 🔍 2. LISTAR REQUISIÇÕES
    async listAll() {
        return await prisma.requisicao.findMany({
            include: {
                usuario: { select: { nome: true, email: true } },
                _count: { select: { itens: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    // 🔍 3. BUSCAR DETALHES DA REQUISIÇÃO
    async findById(id: string) {
        const requisicao = await prisma.requisicao.findUnique({
            where: { id },
            include: {
                usuario: { select: { nome: true, email: true } },
                itens: {
                    include: { produto: { select: { sku: true, descricao: true, unidade_medida: true } } }
                }
            }
        });
        if (!requisicao) throw new AppError('Requisição não encontrada.', 404);
        return requisicao;
    }

    // 🛡️ 4. FLUXO DE APROVAÇÃO (Aprovar / Rejeitar)
    async avaliar(id: string, status: 'APPROVED' | 'REJECTED', justificativa_negacao?: string) {
        const requisicao = await prisma.requisicao.findUnique({ where: { id } });
        if (!requisicao) throw new AppError('Requisição não encontrada.', 404);

        if (requisicao.status !== 'PENDING') {
            throw new AppError('Esta requisição já foi avaliada ou processada.', 400);
        }

        return await prisma.requisicao.update({
            where: { id },
            data: {
                status,
                justificativa_negacao: status === 'REJECTED' ? (justificativa_negacao ?? null) : null
            }
        });
    }

}