import { type Request, type Response, type NextFunction } from 'express';
import { PurchasingService } from './PurchasingService.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class PurchasingController {
    async createRFQ(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { dataLimite, items } = req.body;
            if (!dataLimite) {
                throw new AppError('O campo dataLimite é obrigatório.', 400);
            }
            if (!items || !Array.isArray(items) || items.length === 0) {
                throw new AppError('A lista de items é obrigatória e deve conter pelo menos um item.', 400);
            }

            const service = new PurchasingService();
            const resultado = await service.createRFQ({ dataLimite, items });
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async submitProposta(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { rfqId, fornecedorId, prazoEntrega, itens } = req.body;
            if (!rfqId || !fornecedorId || prazoEntrega === undefined || !itens || !Array.isArray(itens) || itens.length === 0) {
                throw new AppError('Os campos rfqId, fornecedorId, prazoEntrega e itens são obrigatórios.', 400);
            }

            const service = new PurchasingService();
            const resultado = await service.submitProposta({ rfqId, fornecedorId, prazoEntrega, itens });
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async getComparativoPropostas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                throw new AppError('O ID da RFQ é obrigatório.', 400);
            }

            const service = new PurchasingService();
            const resultado = await service.getComparativoPropostas(id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async listRFQs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = new PurchasingService();
            const resultado = await service.listRFQs();
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async getRFQ(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                throw new AppError('O ID da RFQ é obrigatório.', 400);
            }

            const service = new PurchasingService();
            const resultado = await service.getRFQ(id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async cancelRFQ(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                throw new AppError('O ID da RFQ é obrigatório.', 400);
            }

            const service = new PurchasingService();
            const resultado = await service.cancelRFQ(id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}
