import { type Request, type Response, type NextFunction } from 'express';
import { ProdutoService } from './ProdutoService.js';
import { createProdutoSchema, createProdutoBulkSchema } from '../../validators.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class ProdutoController {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dadosValidados = createProdutoBulkSchema.parse(req.body);
            const produtoService = new ProdutoService();
            const resultado = await produtoService.execute(dadosValidados);
            res.status(201).json(resultado);
        } catch (error) { next(error); }
    }

    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const produtoService = new ProdutoService();
            const resultado = await produtoService.listAll();
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async show(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') throw new AppError('ID do produto inválido.', 400);

            const produtoService = new ProdutoService();
            const resultado = await produtoService.findById(id);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') throw new AppError('ID do produto inválido.', 400);

            const dadosValidados = createProdutoSchema.partial().parse(req.body);
            const produtoService = new ProdutoService();
            const resultado = await produtoService.update(id, dadosValidados);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') throw new AppError('ID do produto inválido.', 400);

            const produtoService = new ProdutoService();
            const resultado = await produtoService.delete(id);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }
}