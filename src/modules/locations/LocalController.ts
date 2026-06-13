import { type Request, type Response, type NextFunction } from 'express';
import { LocalService } from './LocalService.js';
import { createLocalSchema, createLocalBulkSchema } from '../../validators.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class LocalController {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dadosValidados = createLocalBulkSchema.parse(req.body);
            const localService = new LocalService();
            const resultado = await localService.execute(dadosValidados);
            res.status(201).json(resultado);
        } catch (error) { next(error); }
    }

    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const localService = new LocalService();
            // Retorna a árvore recursiva pronta para o componente visual do Frontend
            const resultado = await localService.getTree();
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async show(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') throw new AppError('ID inválido.', 400);

            const localService = new LocalService();
            const resultado = await localService.findById(id);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') throw new AppError('ID inválido.', 400);

            const dadosValidados = createLocalSchema.partial().parse(req.body);
            const localService = new LocalService();
            const resultado = await localService.update(id, dadosValidados);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') throw new AppError('ID inválido.', 400);

            const localService = new LocalService();
            const resultado = await localService.delete(id);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }
}