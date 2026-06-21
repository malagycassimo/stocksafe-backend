import type { Request, Response, NextFunction } from 'express';
import { ValidadeService } from './ValidadeService.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class ValidadeController {
    // GET /validade/metricas
    async metricas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validadeService = new ValidadeService();
            const resultado = await validadeService.obterMetricas();
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // GET /validade/produtos-criticos
    async produtosCriticos(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validadeService = new ValidadeService();
            const resultado = await validadeService.listarProdutosCriticos(req.query);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // POST /validade/descartar
    async descartar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { loteId, usuarioId } = req.body;
            const validadeService = new ValidadeService();
            const resultado = await validadeService.descartarLote(loteId, usuarioId);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // POST /validade/descartar-em-massa
    async descartarEmMassa(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { usuarioId } = req.body;
            const validadeService = new ValidadeService();
            const resultado = await validadeService.descartarEmMassa(usuarioId);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // POST /validade/campanha
    async campanha(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { loteId } = req.body;
            const validadeService = new ValidadeService();
            const resultado = await validadeService.criarCampanha(loteId);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // POST /validade/campanhas
    async criarCampanhaValidade(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { descontoPct, loteIds, nome, descricao, dataInicio, dataFim, responsavel } = req.body;
            if (descontoPct === undefined || !loteIds || !Array.isArray(loteIds) || loteIds.length === 0) {
                throw new AppError('Os campos descontoPct e loteIds são obrigatórios.', 400);
            }

            const validadeService = new ValidadeService();
            const resultado = await validadeService.criarCampanhaValidade({
                descontoPct,
                loteIds,
                nome,
                descricao,
                dataInicio,
                dataFim,
                responsavel
            });
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // GET /validade/campanhas
    async listCampanhas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validadeService = new ValidadeService();
            const resultado = await validadeService.listarCampanhas();
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // GET /validade/campanhas/:id
    async obterCampanha(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id as string;
            const validadeService = new ValidadeService();
            const resultado = await validadeService.obterCampanha(id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}
