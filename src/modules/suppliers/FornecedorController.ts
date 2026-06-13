import { type Request, type Response, type NextFunction } from 'express';
import { FornecedorService } from './FornecedorService.js';
import { createFornecedorSchema, createFornecedorBulkSchema } from '../../validators.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class FornecedorController {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dadosValidados = createFornecedorBulkSchema.parse(req.body);
            const fornecedorService = new FornecedorService();
            const resultado = await fornecedorService.execute(dadosValidados);
            res.status(201).json(resultado);
        } catch (error) { next(error); }
    }

    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const fornecedorService = new FornecedorService();
            const resultado = await fornecedorService.listAll();
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async show(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') throw new AppError('ID do fornecedor inválido.', 400);

            const fornecedorService = new FornecedorService();
            const resultado = await fornecedorService.findById(id);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') throw new AppError('ID do fornecedor inválido.', 400);

            const dadosValidados = createFornecedorSchema.partial().parse(req.body);
            const fornecedorService = new FornecedorService();
            const resultado = await fornecedorService.update(id, dadosValidados);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') throw new AppError('ID do fornecedor inválido.', 400);

            const fornecedorService = new FornecedorService();
            const resultado = await fornecedorService.delete(id);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }
}