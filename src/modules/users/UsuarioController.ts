import type { Request, Response, NextFunction } from 'express';
import { UsuarioService } from './UsuarioService.js';
import { createUsuarioSchema } from '../../validators.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class UsuarioController {

    // CRIAR
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const dadosValidados = createUsuarioSchema.parse(req.body);

            const usuarioService = new UsuarioService();
            const resultado = await usuarioService.execute(dadosValidados);

            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }
    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const usuarioService = new UsuarioService();
            const resultado = await usuarioService.listAll();
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }
    async show(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Garante ao TypeScript que o id é uma string e não está indefinido
            if (!id || typeof id !== 'string') {
                throw new AppError('O ID do utilizador é inválido ou não foi fornecido.', 400);
            }

            const usuarioService = new UsuarioService();
            const resultado = await usuarioService.findById(id);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            if (!id || typeof id !== 'string') {
                throw new AppError('O ID do utilizador é inválido ou não foi fornecido.', 400);
            }

            const dadosValidados = createUsuarioSchema.partial().parse(req.body);

            const usuarioService = new UsuarioService();
            const resultado = await usuarioService.update(id, dadosValidados);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            if (!id || typeof id !== 'string') {
                throw new AppError('O ID do utilizador é inválido ou não foi fornecido.', 400);
            }

            const usuarioService = new UsuarioService();
            const resultado = await usuarioService.delete(id);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

}