import { type Request, type Response, type NextFunction } from 'express';
import { ReceivingService } from './ReceivingService.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class ReceivingController {
    async createCheckIn(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { placaVeiculo, motoristaNome, transportador, poCodigo } = req.body;
            if (!placaVeiculo || !motoristaNome || !transportador || !poCodigo) {
                throw new AppError('Os campos placaVeiculo, motoristaNome, transportador e poCodigo são obrigatórios.', 400);
            }

            const service = new ReceivingService();
            const resultado = await service.createCheckIn({ placaVeiculo, motoristaNome, transportador, poCodigo });
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async submitConferencia(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { poId, numeroNotaFiscal, valorTotalNf, itens } = req.body;
            if (!poId || !numeroNotaFiscal || valorTotalNf === undefined || !itens || !Array.isArray(itens) || itens.length === 0) {
                throw new AppError('Os campos poId, numeroNotaFiscal, valorTotalNf e itens são obrigatórios.', 400);
            }

            const service = new ReceivingService();
            const resultado = await service.submitConferencia({ poId, numeroNotaFiscal, valorTotalNf, itens });
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // Purchase Order routes
    async createPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { codigo, fornecedorId, propostaId, totalValue, expectedDelivery, itens } = req.body;
            if (!codigo || !fornecedorId || totalValue === undefined || !expectedDelivery) {
                throw new AppError('Os campos codigo, fornecedorId, totalValue e expectedDelivery são obrigatórios.', 400);
            }

            const service = new ReceivingService();
            const resultado = await service.createPurchaseOrder({ codigo, fornecedorId, propostaId, totalValue, expectedDelivery, itens });
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async listPurchaseOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = new ReceivingService();
            const resultado = await service.listPurchaseOrders();
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async getPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                throw new AppError('O parâmetro id é obrigatório.', 400);
            }
            const service = new ReceivingService();
            const resultado = await service.getPurchaseOrder(id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async cancelPurchaseOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                throw new AppError('O parâmetro id é obrigatório.', 400);
            }
            const service = new ReceivingService();
            const resultado = await service.cancelPurchaseOrder(id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}
