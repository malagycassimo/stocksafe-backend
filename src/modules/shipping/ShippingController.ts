import { type Request, type Response, type NextFunction } from 'express';
import { ShippingService } from './ShippingService.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class ShippingController {
    async createPickingOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { solicitante, itens } = req.body;
            if (!solicitante || !itens || !Array.isArray(itens) || itens.length === 0) {
                throw new AppError('Os campos solicitante e itens são obrigatórios.', 400);
            }

            const service = new ShippingService();
            const resultado = await service.createPickingOrder({ solicitante, itens });
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async concluirPicking(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { pickingId, itensSeparados } = req.body;
            if (!pickingId || !itensSeparados || !Array.isArray(itensSeparados) || itensSeparados.length === 0) {
                throw new AppError('Os campos pickingId e itensSeparados são obrigatórios.', 400);
            }

            const service = new ShippingService();
            const resultado = await service.concluirPicking({ pickingId, itensSeparados });
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async listPickingOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = new ShippingService();
            const resultado = await service.listPickingOrders();
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async getPickingOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                throw new AppError('O ID da ordem é obrigatório.', 400);
            }

            const service = new ShippingService();
            const resultado = await service.getPickingOrder(id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}
