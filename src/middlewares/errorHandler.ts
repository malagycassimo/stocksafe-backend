import { type Request, type Response, type NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (error instanceof ZodError) {
        const mensagens = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        return res.status(400).json({
            error: "Falha na validação dos dados enviados.",
            detalhes: mensagens
        });
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
    }

    console.error('❌ Erro Não Tratado:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
}