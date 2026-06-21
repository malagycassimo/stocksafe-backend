import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class ProdutoService {
    // ➕ CRIAR PRODUTO
    async execute(dados: any) {
        // 1. Se receber uma lista (Array)
        if (Array.isArray(dados)) {
            for (const item of dados) {
                const produtoExiste = await prisma.produto.findUnique({
                    where: { sku: item.sku }
                });

                if (produtoExiste) {
                    throw new AppError(`O SKU '${item.sku}' já está registado noutro produto no StockSafe.`, 400);
                }
            }

            await prisma.produto.createMany({
                data: dados,
                skipDuplicates: true
            });

            return {
                message: `${dados.length} produtos processados e cadastrados com sucesso!`
            };
        }

        // 2. Se receber apenas um objeto isolado
        const produtoExiste = await prisma.produto.findUnique({
            where: { sku: dados.sku }
        });

        if (produtoExiste) {
            throw new AppError(`O SKU '${dados.sku}' já está registado noutro produto no StockSafe.`, 400);
        }

        const produto = await prisma.produto.create({
            data: dados
        });

        return produto;
    }

    // 🔍 LISTAR TODOS
    async listAll() {
        const produtos = await prisma.produto.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return produtos;
    }

    // 🔍 BUSCAR POR ID
    async findById(id: string) {
        const produto = await prisma.produto.findUnique({ where: { id } });
        if (!produto) throw new AppError('Produto não encontrado no sistema.', 404);
        return produto;
    }

    // 🔄 ATUALIZAR
    async update(id: string, dados: any) {
        const produto = await prisma.produto.findUnique({ where: { id } });
        if (!produto) throw new AppError('Produto não encontrado no sistema.', 404);

        if (dados.sku && dados.sku !== produto.sku) {
            const skuEmUso = await prisma.produto.findUnique({ where: { sku: dados.sku } });
            if (skuEmUso) throw new AppError(`O SKU '${dados.sku}' já está a ser usado por outro produto.`, 400);
        }

        const produtoAtualizado = await prisma.produto.update({
            where: { id },
            data: dados
        });

        return produtoAtualizado;
    }

    // ❌ ELIMINAR
    async delete(id: string) {
        const produto = await prisma.produto.findUnique({ where: { id } });
        if (!produto) throw new AppError('Produto não encontrado no sistema.', 404);

        await prisma.produto.delete({ where: { id } });
        return { message: 'Produto removido com sucesso do inventário.' };
    }
}