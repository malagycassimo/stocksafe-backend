import { type Request, type Response, type NextFunction } from 'express';
import { InventoryService } from './InventoryService.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class InventoryController {
    async createInventario(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { dateAgenda, responsavel } = req.body;
            if (!dateAgenda || !responsavel) {
                throw new AppError('Os campos dateAgenda e responsavel são obrigatórios.', 400);
            }

            const service = new InventoryService();
            const resultado = await service.createInventario({ dateAgenda, responsavel });
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async submeterContagem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { itens } = req.body;
            if (!id || typeof id !== 'string') {
                throw new AppError('O ID do inventário é obrigatório.', 400);
            }
            if (!itens || !Array.isArray(itens) || itens.length === 0) {
                throw new AppError('A lista de itens é obrigatória e deve conter pelo menos um item.', 400);
            }

            const service = new InventoryService();
            const resultado = await service.submeterContagem(id, itens);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async ajustarInventario(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { itensAprovados, itensRejeitados, justificativaAjuste } = req.body;
            if (!id || typeof id !== 'string') {
                throw new AppError('O ID do inventário é obrigatório.', 400);
            }
            if (!itensAprovados || !Array.isArray(itensAprovados) || !itensRejeitados || !Array.isArray(itensRejeitados) || !justificativaAjuste) {
                throw new AppError('Os campos itensAprovados, itensRejeitados e justificativaAjuste são obrigatórios.', 400);
            }

            const service = new InventoryService();
            const resultado = await service.ajustarInventario(id, { itensAprovados, itensRejeitados, justificativaAjuste });
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async listInventarios(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = new InventoryService();
            const resultado = await service.listInventarios();
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async getInventario(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                throw new AppError('O ID do inventário é obrigatório.', 400);
            }

            const service = new InventoryService();
            const resultado = await service.getInventario(id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}
