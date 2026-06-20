import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class QualityService {
    async createInspecao(dados: {
        loteEstoqueId: string;
        statusAprovado: boolean;
        parecerTecnico: string;
        temperatura?: number;
        lacreIntegro?: boolean;
        embalagemIntegra?: boolean;
        usuarioId: string;
    }) {
        const lote = await prisma.loteEstoque.findUnique({
            where: { id: dados.loteEstoqueId }
        });

        if (!lote) {
            throw new AppError('Lote de estoque não encontrado.', 404);
        }

        const statusLoteEstoque = dados.statusAprovado ? 'DISPONIVEL' : 'BLOQUEADO';

        // Update LoteEstoque status
        await prisma.loteEstoque.update({
            where: { id: dados.loteEstoqueId },
            data: {
                status: statusLoteEstoque
            }
        });

        // Create InspecaoQualidade
        const inspecao = await prisma.inspecaoQualidade.create({
            data: {
                loteEstoqueId: dados.loteEstoqueId,
                statusAprovado: dados.statusAprovado,
                parecerTecnico: dados.parecerTecnico,
                temperatura: dados.temperatura !== undefined ? dados.temperatura : null,
                lacreIntegro: dados.lacreIntegro !== undefined ? dados.lacreIntegro : true,
                embalagemIntegra: dados.embalagemIntegra !== undefined ? dados.embalagemIntegra : true,
                usuarioId: dados.usuarioId
            }
        });

        return {
            id: inspecao.id,
            loteEstoqueId: inspecao.loteEstoqueId,
            statusAprovado: inspecao.statusAprovado,
            statusLoteEstoque,
            createdAt: inspecao.createdAt.toISOString()
        };
    }

    async listQuarentena() {
        await this.ensureQuarantineItems();

        return prisma.loteEstoque.findMany({
            where: { status: 'QUARENTENA' },
            include: {
                produto: true,
                local: true
            }
        });
    }

    async getQuarantineItem(id: string) {
        const lote = await prisma.loteEstoque.findUnique({
            where: { id },
            include: {
                produto: true,
                local: true
            }
        });

        if (!lote) {
            throw new AppError('Item em quarentena não encontrado.', 404);
        }

        return lote;
    }

    async listInspecoes() {
        const inspecoes = await prisma.inspecaoQualidade.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const loteIds = inspecoes.map(i => i.loteEstoqueId);
        const lotes = await prisma.loteEstoque.findMany({
            where: { id: { in: loteIds } },
            include: { produto: true }
        });

        return inspecoes.map(inspecao => {
            const lote = lotes.find(l => l.id === inspecao.loteEstoqueId);
            return {
                ...inspecao,
                lote: lote ? {
                    codigo_lote: lote.codigo_lote,
                    quantidade: lote.quantidade,
                    produto: lote.produto
                } : null
            };
        });
    }

    private async ensureQuarantineItems() {
        const count = await prisma.loteEstoque.count({
            where: { status: 'QUARENTENA' }
        });

        if (count > 0) return;

        let produto = await prisma.produto.findFirst();
        if (!produto) {
            produto = await prisma.produto.create({
                data: {
                    sku: 'FRS-045',
                    descricao: 'Filé de Frango Congelado - 1kg',
                    categoria: 'Congelado',
                    unidade_medida: 'KG'
                }
            });
        }

        let local = await prisma.local.findFirst();
        if (!local) {
            local = await prisma.local.create({
                data: {
                    codigo: 'QUA-ZONA-A',
                    nome: 'Quarentena - Zona A',
                    tipo: 'ZONA'
                }
            });
        }

        await prisma.loteEstoque.create({
            data: {
                produto_id: produto.id,
                codigo_lote: 'LOT2025-001',
                data_fabricacao: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                data_validade: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                local_id: local.id,
                quantidade: 500,
                valor_unitario: 150.00,
                status: 'QUARENTENA'
            }
        });

        let produto2 = await prisma.produto.findFirst({
            where: { sku: 'ALM-001' }
        });
        if (!produto2) {
            produto2 = await prisma.produto.create({
                data: {
                    sku: 'ALM-001',
                    descricao: 'Arroz Branco Tipo 1 - Pacote 5kg',
                    categoria: 'Geral',
                    unidade_medida: 'UN'
                }
            });
        }

        await prisma.loteEstoque.create({
            data: {
                produto_id: produto2.id,
                codigo_lote: 'LOT2025-023',
                data_fabricacao: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                data_validade: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000),
                local_id: local.id,
                quantidade: 1200,
                valor_unitario: 350.00,
                status: 'QUARENTENA'
            }
        });
    }
}
