import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class LocalService {
    // ➕ CRIAR LOCAL (Ou Sublocal se receber local_pai_id)
    async execute(dados: any) {
        if (Array.isArray(dados)) {
            const result = [];
            for (const item of dados) {
                const codigoExiste = await prisma.local.findUnique({ where: { codigo: item.codigo } });
                if (codigoExiste) throw new AppError(`O código de local '${item.codigo}' já está a ser usado.`, 400);

                if (item.local_pai_id) {
                    const paiExiste = await prisma.local.findUnique({ where: { id: item.local_pai_id } });
                    if (!paiExiste) throw new AppError(`O local pai especificado para o local '${item.codigo}' não existe.`, 404);
                }
                
                const criado = await prisma.local.create({
                    data: item
                });
                result.push(criado);
            }
            return {
                message: `${result.length} locais cadastrados com sucesso!`,
                dados: result
            };
        }

        const codigoExiste = await prisma.local.findUnique({ where: { codigo: dados.codigo } });
        if (codigoExiste) throw new AppError(`O código de local '${dados.codigo}' já está a ser usado.`, 400);

        // Se foi enviado um local pai, valida se ele realmente existe
        if (dados.local_pai_id) {
            const paiExiste = await prisma.local.findUnique({ where: { id: dados.local_pai_id } });
            if (!paiExiste) throw new AppError('O local pai especificado não existe.', 404);
        }

        return await prisma.local.create({
            data: dados
        });
    }

    // 🔍 LISTAR ÁRVORE COMPLETA (Traz os Armazéns de topo e inclui os seus filhos)
    async getTree() {
        return await prisma.local.findMany({
            where: { local_pai_id: null }, // Começa pelos Armazéns Raiz
            include: {
                sublocais: {
                    include: {
                        sublocais: {
                            include: {
                                sublocais: {
                                    include: { sublocais: true } // Desce até às Posições
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { codigo: 'asc' }
        });
    }

    // 🔍 BUSCAR POR ID
    async findById(id: string) {
        const local = await prisma.local.findUnique({
            where: { id },
            include: { sublocais: true, local_pai: true }
        });
        if (!local) throw new AppError('Local não encontrado.', 404);
        return local;
    }

    // 🔄 ATUALIZAR
    async update(id: string, dados: any) {
        const local = await prisma.local.findUnique({ where: { id } });
        if (!local) throw new AppError('Local não encontrado.', 404);

        if (dados.codigo && dados.codigo !== local.codigo) {
            const codigoEmUso = await prisma.local.findUnique({ where: { codigo: dados.codigo } });
            if (codigoEmUso) throw new AppError(`O código '${dados.codigo}' já está em uso.`, 400);
        }

        return await prisma.local.update({
            where: { id },
            data: dados
        });
    }

    // ❌ ELIMINAR (Graças ao Cascade do Prisma, remover um Armazém limpa os seus sublocais de cascata)
    async delete(id: string) {
        const local = await prisma.local.findUnique({ where: { id } });
        if (!local) throw new AppError('Local não encontrado.', 404);

        await prisma.local.delete({ where: { id } });
        return { message: 'Local e toda a sua árvore de sublocais removidos com sucesso.' };
    }
}