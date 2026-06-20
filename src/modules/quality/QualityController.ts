import { type Request, type Response, type NextFunction } from 'express';
import { QualityService } from './QualityService.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class QualityController {
    async createInspecao(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { loteEstoqueId, statusAprovado, parecerTecnico, temperatura, lacreIntegro, embalagemIntegra, usuarioId } = req.body;
            if (!loteEstoqueId || statusAprovado === undefined || !parecerTecnico || !usuarioId) {
                throw new AppError('Os campos loteEstoqueId, statusAprovado, parecerTecnico e usuarioId são obrigatórios.', 400);
            }

            const service = new QualityService();
            const resultado = await service.createInspecao({
                loteEstoqueId,
                statusAprovado,
                parecerTecnico,
                temperatura,
                lacreIntegro,
                embalagemIntegra,
                usuarioId
            });
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async listQuarentena(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = new QualityService();
            const resultado = await service.listQuarentena();
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async getQuarantineItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id) {
                throw new AppError('O parâmetro id é obrigatório.', 400);
            }

            const service = new QualityService();
            const resultado = await service.getQuarantineItem(id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async listInspecoes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = new QualityService();
            const resultado = await service.listInspecoes();
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}
