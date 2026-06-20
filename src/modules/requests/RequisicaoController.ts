import type { Request, Response, NextFunction } from 'express';
import { RequisicaoService } from './RequisicaoService.js';
import { createRequisicaoBulkSchema, analiseRequisicaoSchema } from '../../validators.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { prisma } from '../../lib/prisma.js';

export class RequisicaoController {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dadosValidados = createRequisicaoBulkSchema.parse(req.body);

            let usuario_id = req.headers['x-user-id'] as string;
            if (!usuario_id) {
                // Tenta obter o primeiro utilizador ativo como fallback para testes de API / Swagger
                const defaultUser = await prisma.user.findFirst({
                    where: { statusAtivo: true }
                });
                if (defaultUser) {
                    usuario_id = defaultUser.id;
                } else {
                    throw new AppError('O ID do utilizador (x-user-id) é obrigatório no cabeçalho da requisição para testes.', 400);
                }
            }

            const requisicaoService = new RequisicaoService();
            const resultado = await requisicaoService.create(usuario_id, dadosValidados);

            res.status(201).json({
                success: true,
                message: "Requisição processada com sucesso.",
                data: resultado
            });
        } catch (error) {
            next(error);
        }
    }

    // 🔍 2. LISTAR TODAS AS REQUISIÇÕES (Para a tabela do ecrã principal)
    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const requisicaoService = new RequisicaoService();
            const resultado = await requisicaoService.listAll();

            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // 🔍 3. VER DETALHES DE UMA REQUISIÇÃO ESPECÍFICA
    async show(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // 💡 Proteção de tipo contra arrays ou strings inválidas
            if (!id || typeof id !== 'string') {
                throw new AppError('O ID da requisição fornecido é inválido.', 400);
            }

            const requisicaoService = new RequisicaoService();
            const resultado = await requisicaoService.findById(id);

            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }


    async avaliar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                throw new AppError('O ID da requisição fornecido é inválido.', 400);
            }

            // 🛡️ Valida os dados do corpo via Zod
            const { status, justificativa_negacao } = analiseRequisicaoSchema.parse(req.body);

            // 🛡️ Validações extra de negócio na API
            if (status === 'APPROVED' && justificativa_negacao) {
                throw new AppError('A justificativa de negação não pode ser fornecida quando o status é APPROVED.', 400);
            }
            if (status === 'REJECTED' && !justificativa_negacao) {
                throw new AppError('A justificativa de negação é obrigatória quando o status é REJECTED.', 400);
            }

            const requisicaoService = new RequisicaoService();

            // 💡 RESOLUÇÃO DO ERRO: Transforma null em undefined para satisfazer o Service
            const resultado = await requisicaoService.avaliar(
                id,
                status,
                justificativa_negacao || undefined
            );

            res.status(200).json({
                success: true,
                message: `Requisição processada com estado: ${status}`,
                data: resultado
            });
        } catch (error) {
            next(error);
        }
    }
}