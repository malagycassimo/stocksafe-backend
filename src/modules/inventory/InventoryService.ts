import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class InventoryService {
    async createInventario(dados: { dateAgenda: string; responsavel: string }) {
        const year = new Date().getFullYear();
        const count = await prisma.inventarioAgendamento.count();
        const codigo = `INV-${year}-${String(count + 1).padStart(3, '0')}`;

        const inventario = await prisma.inventarioAgendamento.create({
            data: {
                codigo,
                dateAgenda: new Date(dados.dateAgenda),
                responsavel: dados.responsavel,
                status: 'AGENDADO'
            }
        });

        return {
            id: inventario.id,
            codigo: inventario.codigo,
            status: inventario.status,
            dateAgenda: inventario.dateAgenda.toISOString()
        };
    }

    async submeterContagem(inventarioId: string, itens: { produtoId: string; quantidadeContada: number }[]) {
        const inventario = await prisma.inventarioAgendamento.findUnique({
            where: { id: inventarioId }
        });

        if (!inventario) {
            throw new AppError('Agendamento de inventário não encontrado.', 404);
        }

        // We will compute system quantities, insert/update InventarioItem, and count discrepancies
        let divergenciasEncontradas = 0;

        for (const item of itens) {
            // Find total system stock for product
            const lotes = await prisma.loteEstoque.findMany({
                where: { produto_id: item.produtoId }
            });
            const quantidadeSistema = lotes.reduce((acc, l) => acc + l.quantidade, 0);
            const divergencia = item.quantidadeContada - quantidadeSistema;

            if (divergencia !== 0) {
                divergenciasEncontradas++;
            }

            // Check if InventarioItem already exists for this inventory & product
            const itemExistente = await prisma.inventarioItem.findFirst({
                where: {
                    inventarioId,
                    produtoId: item.produtoId
                }
            });

            if (itemExistente) {
                await prisma.inventarioItem.update({
                    where: { id: itemExistente.id },
                    data: {
                        quantidadeSistema,
                        quantidadeContada: item.quantidadeContada,
                        divergencia,
                        statusAjuste: 'PENDENTE'
                    }
                });
            } else {
                await prisma.inventarioItem.create({
                    data: {
                        inventarioId,
                        produtoId: item.produtoId,
                        quantidadeSistema,
                        quantidadeContada: item.quantidadeContada,
                        divergencia,
                        statusAjuste: 'PENDENTE'
                    }
                });
            }
        }

        // Update status of inventory scheduling
        const updatedInventario = await prisma.inventarioAgendamento.update({
            where: { id: inventarioId },
            data: {
                status: 'AGUARDANDO_APROVACAO'
            }
        });

        return {
            id: updatedInventario.id,
            status: updatedInventario.status,
            divergenciasEncontradas
        };
    }

    async ajustarInventario(
        inventarioId: string,
        dados: {
            itensAprovados: string[];
            itensRejeitados: string[];
            justificativaAjuste: string;
        }
    ) {
        const inventario = await prisma.inventarioAgendamento.findUnique({
            where: { id: inventarioId },
            include: { itens: true }
        });

        if (!inventario) {
            throw new AppError('Agendamento de inventário não encontrado.', 404);
        }

        // Process approved adjustments
        for (const itemId of dados.itensAprovados) {
            const item = await prisma.inventarioItem.findUnique({
                where: { id: itemId }
            });

            if (!item || item.inventarioId !== inventarioId) continue;

            await prisma.inventarioItem.update({
                where: { id: itemId },
                data: {
                    statusAjuste: 'APROVADO',
                    justificativaAjuste: dados.justificativaAjuste
                }
            });

            // Adjust actual stock in LoteEstoque and create MovimentacaoEstoque
            const divergencia = item.divergencia || 0;
            if (divergencia !== 0) {
                if (divergencia > 0) {
                    // Find a batch of this product to add the quantity, or if none, try to find product first
                    const lote = await prisma.loteEstoque.findFirst({
                        where: { produto_id: item.produtoId }
                    });

                    if (lote) {
                        await prisma.loteEstoque.update({
                            where: { id: lote.id },
                            data: {
                                quantidade: lote.quantidade + divergencia
                            }
                        });

                        await prisma.movimentacaoEstoque.create({
                            data: {
                                produto_id: item.produtoId,
                                codigo_lote: lote.codigo_lote,
                                tipo: 'AJUSTE',
                                quantidade: divergencia,
                                destino_id: lote.local_id,
                                justificativa: dados.justificativaAjuste,
                                usuario_id: 'SISTEMA'
                            }
                        });
                    }
                } else {
                    // Stock reduction
                    let aReduzir = Math.abs(divergencia);
                    const lotes = await prisma.loteEstoque.findMany({
                        where: { produto_id: item.produtoId },
                        orderBy: { data_validade: 'asc' } // FEFO/FIFO order to reduce
                    });

                    for (const lote of lotes) {
                        if (aReduzir <= 0) break;
                        const qtdLote = lote.quantidade;
                        if (qtdLote >= aReduzir) {
                            await prisma.loteEstoque.update({
                                where: { id: lote.id },
                                data: {
                                    quantidade: qtdLote - aReduzir
                                }
                            });

                            await prisma.movimentacaoEstoque.create({
                                data: {
                                    produto_id: item.produtoId,
                                    codigo_lote: lote.codigo_lote,
                                    tipo: 'AJUSTE',
                                    quantidade: aReduzir,
                                    origem_id: lote.local_id,
                                    justificativa: dados.justificativaAjuste,
                                    usuario_id: 'SISTEMA'
                                }
                            });

                            aReduzir = 0;
                        } else {
                            await prisma.loteEstoque.update({
                                where: { id: lote.id },
                                data: {
                                    quantidade: 0
                                }
                            });

                            await prisma.movimentacaoEstoque.create({
                                data: {
                                    produto_id: item.produtoId,
                                    codigo_lote: lote.codigo_lote,
                                    tipo: 'AJUSTE',
                                    quantidade: qtdLote,
                                    origem_id: lote.local_id,
                                    justificativa: dados.justificativaAjuste,
                                    usuario_id: 'SISTEMA'
                                }
                            });

                            aReduzir -= qtdLote;
                        }
                    }
                }
            }
        }

        // Process rejected adjustments
        for (const itemId of dados.itensRejeitados) {
            await prisma.inventarioItem.update({
                where: { id: itemId },
                data: {
                    statusAjuste: 'REJEITADO',
                    justificativaAjuste: dados.justificativaAjuste
                }
            });
        }

        // Mark inventory as completed
        await prisma.inventarioAgendamento.update({
            where: { id: inventarioId },
            data: {
                status: 'CONCLUIDO'
            }
        });

        return {
            status: 'CONCLUIDO',
            mensagem: 'Estoque atualizado e ajustado com sucesso.'
        };
    }

    async listInventarios() {
        return await prisma.inventarioAgendamento.findMany({
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

    async getInventario(id: string) {
        const inventario = await prisma.inventarioAgendamento.findUnique({
            where: { id },
            include: {
                itens: {
                    include: {
                        produto: true
                    }
                }
            }
        });

        if (!inventario) {
            throw new AppError('Inventário não encontrado.', 404);
        }

        // If it is newly scheduled and has no items, pre-populate them from system products so the counting UI has items to show
        if (inventario.itens.length === 0) {
            const produtos = await prisma.produto.findMany();
            const itemsPrePopulated = [];
            for (const prod of produtos) {
                const lotes = await prisma.loteEstoque.findMany({
                    where: { produto_id: prod.id },
                    include: { local: true }
                });
                const qty = lotes.reduce((acc, l) => acc + l.quantidade, 0);
                const lotCode = lotes[0]?.codigo_lote || "LOTE-PADRAO";
                const location = lotes[0]?.local?.codigo || "ARM01";

                itemsPrePopulated.push({
                    id: prod.id,
                    produtoId: prod.id,
                    produto: prod,
                    quantidadeSistema: qty,
                    quantidadeContada: null,
                    divergencia: null,
                    statusAjuste: 'PENDENTE',
                    lot: lotCode,
                    location: location
                });
            }
            return {
                ...inventario,
                itens: itemsPrePopulated
            };
        }

        return inventario;
    }
}
