import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class ReceivingService {
    async createCheckIn(dados: {
        placaVeiculo: string;
        motoristaNome: string;
        transportador: string;
        poCodigo: string;
    }) {
        const year = new Date().getFullYear();
        const count = await prisma.checkIn.count();
        const codigoCheckIn = `CHK-${year}-${String(count + 1).padStart(3, '0')}`;

        const checkIn = await prisma.checkIn.create({
            data: {
                codigoCheckIn,
                placaVeiculo: dados.placaVeiculo,
                motoristaNome: dados.motoristaNome,
                transportador: dados.transportador,
                poCodigo: dados.poCodigo,
                status: 'AGUARDANDO'
            }
        });

        // Try to find if a PO exists with this code, and update its status if appropriate
        try {
            const po = await prisma.purchaseOrder.findFirst({
                where: { codigo: dados.poCodigo }
            });
            if (po && po.status === 'EMITIDO') {
                await prisma.purchaseOrder.update({
                    where: { id: po.id },
                    data: { status: 'CONFIRMADO' }
                });
            }
        } catch (err) {
            console.error('Erro ao atualizar status da PurchaseOrder:', err);
        }

        return {
            id: checkIn.id,
            codigoCheckIn: checkIn.codigoCheckIn,
            status: checkIn.status,
            createdAt: checkIn.createdAt.toISOString()
        };
    }

    async submitConferencia(dados: {
        poId: string;
        numeroNotaFiscal: string;
        valorTotalNf: number;
        itens: {
            produtoId: string;
            quantidadePedido: number;
            quantidadeNota: number;
            quantidadeFisica: number;
            divergente: boolean;
        }[];
    }) {
        // Calculate divergenceTotal
        let divergenciaTotal = 0;
        let temDivergencia = false;

        for (const item of dados.itens) {
            const diff = item.quantidadeFisica - item.quantidadeNota;
            divergenciaTotal += diff;
            if (item.divergente || diff !== 0 || item.quantidadeFisica !== item.quantidadePedido) {
                temDivergencia = true;
            }
        }

        const status = temDivergencia ? 'CONCLUIDO_COM_DIVERGENCIA' : 'CONCLUIDO';

        const conferencia = await prisma.conferenciaFiscal.create({
            data: {
                poId: dados.poId,
                numeroNotaFiscal: dados.numeroNotaFiscal,
                valorTotalNf: dados.valorTotalNf,
                divergenciaTotal: Number(divergenciaTotal.toFixed(2)),
                status,
                itens: {
                    create: dados.itens.map(item => ({
                        produtoId: item.produtoId,
                        quantidadePedido: item.quantidadePedido,
                        quantidadeNota: item.quantidadeNota,
                        quantidadeFísica: item.quantidadeFisica, // Map physical quantity
                        divergente: item.divergente
                    }))
                }
            }
        });

        // Try to update PO status
        try {
            const po = await prisma.purchaseOrder.findUnique({
                where: { id: dados.poId }
            });
            if (po) {
                await prisma.purchaseOrder.update({
                    where: { id: po.id },
                    data: { status: 'FATURADO' }
                });
            }
        } catch (err) {
            console.error('Erro ao atualizar status da PurchaseOrder após conferência:', err);
        }

        return {
            id: conferencia.id,
            poId: conferencia.poId,
            divergenciaTotal: conferencia.divergenciaTotal,
            status: conferencia.status
        };
    }

    async createPurchaseOrder(dados: {
        codigo: string;
        fornecedorId: string;
        propostaId?: string;
        totalValue: number;
        expectedDelivery: string;
        itens?: { produtoId: string; quantidade: number; precoUnitario: number }[];
    }) {
        const fornecedor = await prisma.fornecedor.findUnique({
            where: { id: dados.fornecedorId }
        });
        if (!fornecedor) {
            throw new AppError('Fornecedor não encontrado.', 404);
        }

        let resolvedPropostaId = dados.propostaId || null;

        if (!resolvedPropostaId && dados.itens && dados.itens.length > 0) {
            const rfq = await prisma.rFQ.create({
                data: {
                    codigo: `RFQ-MANUAL-${Date.now()}`,
                    dataLimite: new Date(),
                    status: 'CLOSED'
                }
            });

            const proposta = await prisma.propostaFornecedor.create({
                data: {
                    rfqId: rfq.id,
                    fornecedorId: dados.fornecedorId,
                    status: 'APPROVED',
                    prazoEntrega: 5,
                    itens: {
                        create: dados.itens.map(it => ({
                            produtoId: it.produtoId,
                            precoUnitario: it.precoUnitario,
                            quantidade: it.quantidade
                        }))
                    }
                }
            });
            resolvedPropostaId = proposta.id;
        }

        const po = await prisma.purchaseOrder.create({
            data: {
                codigo: dados.codigo,
                fornecedorId: dados.fornecedorId,
                propostaId: resolvedPropostaId,
                totalValue: dados.totalValue,
                expectedDelivery: new Date(dados.expectedDelivery),
                status: 'EMITIDO'
            },
            include: {
                fornecedor: true
            }
        });

        let propostaObj: any = null;
        if (po.propostaId) {
            const proposta = await prisma.propostaFornecedor.findUnique({
                where: { id: po.propostaId },
                include: {
                    rfq: true,
                    itens: true
                }
            });
            if (proposta) {
                propostaObj = {
                    id: proposta.id,
                    rfq: proposta.rfq ? {
                        id: proposta.rfq.id,
                        codigo: proposta.rfq.codigo
                    } : null,
                    itens: proposta.itens.map(it => ({
                        produtoId: it.produtoId,
                        quantidade: it.quantidade,
                        precoUnitario: it.precoUnitario
                    }))
                };
            }
        }

        return {
            id: po.id,
            codigo: po.codigo,
            status: po.status,
            totalValue: po.totalValue,
            expectedDelivery: po.expectedDelivery.toISOString(),
            createdAt: po.createdAt.toISOString(),
            fornecedorId: po.fornecedorId,
            propostaId: po.propostaId,
            fornecedor: {
                razao_social: po.fornecedor.razao_social,
                nome_fantasia: po.fornecedor.nome_fantasia
            },
            proposta: propostaObj,
            checkIn: null
        };
    }

    async listPurchaseOrders() {
        const pos = await prisma.purchaseOrder.findMany({
            include: {
                fornecedor: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const checkIns = await prisma.checkIn.findMany();

        const propostaIds = pos.map(p => p.propostaId).filter(Boolean) as string[];
        const propostas = await prisma.propostaFornecedor.findMany({
            where: { id: { in: propostaIds } },
            include: {
                rfq: true,
                itens: true
            }
        });

        return pos.map(po => {
            const checkIn = checkIns.find(c => c.poCodigo === po.codigo);
            const proposta = propostas.find(pr => pr.id === po.propostaId);

            return {
                id: po.id,
                codigo: po.codigo,
                status: po.status,
                totalValue: po.totalValue,
                expectedDelivery: po.expectedDelivery.toISOString(),
                createdAt: po.createdAt.toISOString(),
                fornecedorId: po.fornecedorId,
                propostaId: po.propostaId,
                fornecedor: {
                    razao_social: po.fornecedor.razao_social,
                    nome_fantasia: po.fornecedor.nome_fantasia
                },
                proposta: proposta ? {
                    id: proposta.id,
                    rfq: proposta.rfq ? {
                        id: proposta.rfq.id,
                        codigo: proposta.rfq.codigo
                    } : null,
                    itens: proposta.itens.map(it => ({
                        produtoId: it.produtoId,
                        quantidade: it.quantidade,
                        precoUnitario: it.precoUnitario
                    }))
                } : null,
                checkIn: checkIn ? {
                    id: checkIn.id,
                    codigoCheckIn: checkIn.codigoCheckIn,
                    status: checkIn.status,
                    createdAt: checkIn.createdAt.toISOString()
                } : null
            };
        });
    }

    async getPurchaseOrder(id: string) {
        let po = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                fornecedor: true
            }
        });

        if (!po) {
            po = await prisma.purchaseOrder.findFirst({
                where: { codigo: id },
                include: {
                    fornecedor: true
                }
            });
        }

        if (!po) {
            throw new AppError('Pedido de Compra não encontrado.', 404);
        }

        const checkIn = await prisma.checkIn.findFirst({
            where: { poCodigo: po.codigo }
        });

        let itens: any[] = [];
        let propostaObj: any = null;

        if (po.propostaId) {
            const proposta = await prisma.propostaFornecedor.findUnique({
                where: { id: po.propostaId },
                include: {
                    rfq: true,
                    itens: {
                        include: {
                            produto: true
                        }
                    }
                }
            });
            if (proposta) {
                propostaObj = {
                    id: proposta.id,
                    rfq: proposta.rfq ? {
                        id: proposta.rfq.id,
                        codigo: proposta.rfq.codigo
                    } : null,
                    itens: proposta.itens.map(it => ({
                        produtoId: it.produtoId,
                        quantidade: it.quantidade,
                        precoUnitario: it.precoUnitario
                    }))
                };
                itens = proposta.itens.map(item => ({
                    produtoId: item.produtoId,
                    sku: item.produto.sku,
                    description: item.produto.descricao,
                    category: item.produto.categoria,
                    qtyExpected: item.quantidade,
                    unit: item.produto.unidade_medida,
                    price: item.precoUnitario
                }));
            }
        }

        return {
            id: po.id,
            codigo: po.codigo,
            status: po.status,
            totalValue: po.totalValue,
            expectedDelivery: po.expectedDelivery.toISOString(),
            createdAt: po.createdAt.toISOString(),
            fornecedorId: po.fornecedorId,
            propostaId: po.propostaId,
            fornecedor: {
                razao_social: po.fornecedor.razao_social,
                nome_fantasia: po.fornecedor.nome_fantasia,
                nuit: po.fornecedor.nuit,
                email_principal: po.fornecedor.email_principal
            },
            proposta: propostaObj,
            checkIn: checkIn ? {
                id: checkIn.id,
                codigoCheckIn: checkIn.codigoCheckIn,
                status: checkIn.status,
                createdAt: checkIn.createdAt.toISOString()
            } : null,
            itens
        };
    }

    async cancelPurchaseOrder(id: string) {
        let po = await prisma.purchaseOrder.findUnique({
            where: { id }
        });

        if (!po) {
            po = await prisma.purchaseOrder.findFirst({
                where: { codigo: id }
            });
        }

        if (!po) {
            throw new AppError('Pedido de Compra não encontrado.', 404);
        }

        const updatedPo = await prisma.purchaseOrder.update({
            where: { id: po.id },
            data: { status: 'CANCELADO' },
            include: {
                fornecedor: true
            }
        });

        return {
            id: updatedPo.id,
            codigo: updatedPo.codigo,
            status: updatedPo.status,
            totalValue: updatedPo.totalValue,
            expectedDelivery: updatedPo.expectedDelivery.toISOString(),
            createdAt: updatedPo.createdAt.toISOString(),
            fornecedorId: updatedPo.fornecedorId,
            propostaId: updatedPo.propostaId,
            fornecedor: {
                razao_social: updatedPo.fornecedor.razao_social,
                nome_fantasia: updatedPo.fornecedor.nome_fantasia
            }
        };
    }
}

