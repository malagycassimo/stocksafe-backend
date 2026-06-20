import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class ShippingService {
    async createPickingOrder(dados: { solicitante: string; itens: { produtoId: string; quantidade: number }[] }) {
        const year = new Date().getFullYear();
        const count = await prisma.pickingOrder.count();
        const codigo = `PKG-${year}-${String(count + 1).padStart(3, '0')}`;

        // Verify products exist
        for (const item of dados.itens) {
            const produto = await prisma.produto.findUnique({
                where: { id: item.produtoId }
            });
            if (!produto) {
                throw new AppError(`Produto com ID '${item.produtoId}' não encontrado.`, 404);
            }
        }

        const order = await prisma.pickingOrder.create({
            data: {
                codigo,
                solicitante: dados.solicitante,
                status: 'PENDENTE',
                itens: {
                    create: dados.itens.map(item => ({
                        produtoId: item.produtoId,
                        quantidade: item.quantidade
                    }))
                }
            }
        });

        return {
            id: order.id,
            codigo: order.codigo,
            status: order.status
        };
    }

    async concluirPicking(dados: {
        pickingId: string;
        itensSeparados: { produtoId: string; loteSeparado: string; quantidadeSeparada: number }[];
    }) {
        const order = await prisma.pickingOrder.findUnique({
            where: { id: dados.pickingId },
            include: { itens: true }
        });

        if (!order) {
            throw new AppError('Ordem de picking não encontrada.', 404);
        }

        let fefoViolado = false;

        // Process each separated item
        for (const item of dados.itensSeparados) {
            // Find the picked batch in the system
            const pickedLote = await prisma.loteEstoque.findFirst({
                where: {
                    produto_id: item.produtoId,
                    codigo_lote: item.loteSeparado,
                    quantidade: { gt: 0 }
                }
            });

            if (!pickedLote) {
                throw new AppError(`Lote '${item.loteSeparado}' com quantidade disponível para o produto não encontrado no sistema.`, 404);
            }

            if (pickedLote.quantidade < item.quantidadeSeparada) {
                throw new AppError(`Quantidade insuficiente no lote '${item.loteSeparado}'. Disponível: ${pickedLote.quantidade}, Solicitada: ${item.quantidadeSeparada}`, 400);
            }

            // FEFO validation: check if there are other available batches of the same product that expire earlier
            const alternativeLotes = await prisma.loteEstoque.findMany({
                where: {
                    produto_id: item.produtoId,
                    quantidade: { gt: 0 },
                    status: { in: ['DISPONIVEL', 'CAMPANHA'] },
                    id: { not: pickedLote.id }
                },
                orderBy: { data_validade: 'asc' }
            });

            const pickedExpiry = new Date(pickedLote.data_validade).getTime();
            for (const alt of alternativeLotes) {
                const altExpiry = new Date(alt.data_validade).getTime();
                if (altExpiry < pickedExpiry) {
                    fefoViolado = true;
                    break;
                }
            }

            // Deduct the quantity from LoteEstoque
            await prisma.loteEstoque.update({
                where: { id: pickedLote.id },
                data: {
                    quantidade: pickedLote.quantidade - item.quantidadeSeparada
                }
            });

            // Log stock movement
            await prisma.movimentacaoEstoque.create({
                data: {
                    produto_id: item.produtoId,
                    codigo_lote: item.loteSeparado,
                    tipo: 'SAIDA',
                    quantidade: item.quantidadeSeparada,
                    origem_id: pickedLote.local_id,
                    justificativa: `Expedição - Ordem de Picking ${order.codigo}`,
                    usuario_id: 'SISTEMA'
                }
            });

            // Update PickingItem if it exists
            const pickingItem = await prisma.pickingItem.findFirst({
                where: {
                    pickingId: dados.pickingId,
                    produtoId: item.produtoId
                }
            });

            if (pickingItem) {
                await prisma.pickingItem.update({
                    where: { id: pickingItem.id },
                    data: {
                        loteSeparado: item.loteSeparado,
                        quantidade: item.quantidadeSeparada
                    }
                });
            } else {
                // If it wasn't originally in the order, we still link it
                await prisma.pickingItem.create({
                    data: {
                        pickingId: dados.pickingId,
                        produtoId: item.produtoId,
                        quantidade: item.quantidadeSeparada,
                        loteSeparado: item.loteSeparado
                    }
                });
            }
        }

        // Update order status to PRONTO
        await prisma.pickingOrder.update({
            where: { id: dados.pickingId },
            data: { status: 'PRONTO' }
        });

        const mensagem = fefoViolado
            ? 'Atenção: Separação concluída, mas as regras de FEFO foram violadas (havia lotes com data de validade mais próxima).'
            : 'Separação validada e concluída com sucesso.';

        return {
            pickingId: order.id,
            status: 'PRONTO',
            fefoViolado,
            mensagem
        };
    }

    async listPickingOrders() {
        return await prisma.pickingOrder.findMany({
            include: {
                itens: {
                    include: {
                        produto: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getPickingOrder(id: string) {
        const order = await prisma.pickingOrder.findUnique({
            where: { id },
            include: {
                itens: {
                    include: {
                        produto: true
                    }
                }
            }
        });

        if (!order) {
            throw new AppError('Ordem de picking não encontrada.', 404);
        }

        return order;
    }
}
