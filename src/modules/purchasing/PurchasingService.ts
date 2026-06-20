import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class PurchasingService {
    async createRFQ(dados: { dataLimite: string; items: { produtoId: string; quantidade: number }[] }) {
        const year = new Date().getFullYear();
        const count = await prisma.rFQ.count();
        const codigo = `RFQ-${year}-${String(count + 1).padStart(3, '0')}`;

        // Verify if all products exist
        for (const item of dados.items) {
            const produto = await prisma.produto.findUnique({
                where: { id: item.produtoId }
            });
            if (!produto) {
                throw new AppError(`Produto com ID '${item.produtoId}' não encontrado.`, 404);
            }
        }

        const rfq = await prisma.rFQ.create({
            data: {
                codigo,
                dataLimite: new Date(dados.dataLimite),
                status: 'PENDING',
                items: {
                    create: dados.items.map(item => ({
                        produtoId: item.produtoId,
                        quantidade: item.quantidade
                    }))
                }
            },
            include: {
                items: true
            }
        });

        return {
            id: rfq.id,
            codigo: rfq.codigo,
            status: rfq.status,
            dataLimite: rfq.dataLimite.toISOString(),
            createdAt: rfq.createdAt.toISOString()
        };
    }

    async submitProposta(dados: {
        rfqId: string;
        fornecedorId: string;
        prazoEntrega: number;
        itens: { produtoId: string; precoUnitario: number; quantidade: number }[];
    }) {
        const rfq = await prisma.rFQ.findUnique({
            where: { id: dados.rfqId }
        });
        if (!rfq) {
            throw new AppError('RFQ não encontrada.', 404);
        }

        const fornecedor = await prisma.fornecedor.findUnique({
            where: { id: dados.fornecedorId }
        });
        if (!fornecedor) {
            throw new AppError('Fornecedor não encontrado.', 404);
        }

        // Verify if all products exist
        for (const item of dados.itens) {
            const produto = await prisma.produto.findUnique({
                where: { id: item.produtoId }
            });
            if (!produto) {
                throw new AppError(`Produto com ID '${item.produtoId}' não encontrado.`, 404);
            }
        }

        const proposta = await prisma.propostaFornecedor.create({
            data: {
                rfqId: dados.rfqId,
                fornecedorId: dados.fornecedorId,
                prazoEntrega: dados.prazoEntrega,
                status: 'SUBMITTED',
                itens: {
                    create: dados.itens.map(item => ({
                        produtoId: item.produtoId,
                        precoUnitario: item.precoUnitario,
                        quantidade: item.quantidade
                    }))
                }
            }
        });

        // Also check if we should update RFQ status to RESPONDED if it is currently PENDING
        if (rfq.status === 'PENDING') {
            await prisma.rFQ.update({
                where: { id: dados.rfqId },
                data: { status: 'RESPONDED' }
            });
        }

        return {
            id: proposta.id,
            rfqId: proposta.rfqId,
            fornecedorId: proposta.fornecedorId,
            status: proposta.status,
            prazoEntrega: proposta.prazoEntrega
        };
    }

    async getComparativoPropostas(rfqId: string) {
        const rfq = await prisma.rFQ.findUnique({
            where: { id: rfqId },
            include: {
                propostas: {
                    include: {
                        fornecedor: true,
                        itens: {
                            include: {
                                produto: true
                            }
                        }
                    }
                }
            }
        });

        if (!rfq) {
            throw new AppError('RFQ não encontrada.', 404);
        }

        const propostasMapeadas = rfq.propostas.map(prop => {
            const valorTotal = prop.itens.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);
            return {
                propostaId: prop.id,
                fornecedorNome: prop.fornecedor.razao_social,
                prazoEntrega: prop.prazoEntrega,
                valorTotal,
                itens: prop.itens.map(item => ({
                    produtoSku: item.produto.sku,
                    produtoDescricao: item.produto.descricao,
                    precoUnitario: item.precoUnitario,
                    quantidade: item.quantidade
                }))
            };
        });

        return {
            rfqId: rfq.id,
            codigo: rfq.codigo,
            propostas: propostasMapeadas
        };
    }

    async listRFQs() {
        return await prisma.rFQ.findMany({
            include: {
                items: {
                    include: {
                        produto: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getRFQ(id: string) {
        const rfq = await prisma.rFQ.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        produto: true
                    }
                },
                propostas: {
                    include: {
                        fornecedor: true,
                        itens: {
                            include: {
                                produto: true
                            }
                        }
                    }
                }
            }
        });

        if (!rfq) {
            throw new AppError('RFQ não encontrada.', 404);
        }

        return rfq;
    }
}
