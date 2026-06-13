// import type { Request, Response, NextFunction } from 'express';
// import { EstoqueService } from './EstoqueService.js';
// import { estoqueQuerySchema } from '../../validators.js';

// export class EstoqueController {
//     async index(req: Request, res: Response, next: NextFunction): Promise<void> {
//         try {
//             const filtros = estoqueQuerySchema.parse(req.query);
//             const estoqueService = new EstoqueService();
//             const resultado = await estoqueService.consultarEstoque(filtros);
//             res.status(200).json(resultado);
//         } catch (error) { next(error); }
//     }

//     async dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
//         try {
//             const estoqueService = new EstoqueService();
//             const resultado = await estoqueService.obterMetricasPainel();
//             res.status(200).json(resultado);
//         } catch (error) { next(error); }
//     }
// }


import type { Request, Response, NextFunction } from 'express';
import { EstoqueService } from './EstoqueService.js';
import { estoqueQuerySchema } from '../../validators.js';

export class EstoqueController {
    // GET /estoque
    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const filtros = estoqueQuerySchema.parse(req.query);
            const estoqueService = new EstoqueService();
            const resultado = await estoqueService.consultarEstoque(filtros);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    // GET /estoque/metricas (ou /estoque/dashboard)
    async dashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const estoqueService = new EstoqueService();
            const resultado = await estoqueService.obterMetricasPainel();
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }

    // POST /estoque/entrada
    async entrada(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const estoqueService = new EstoqueService();
            const resultado = await estoqueService.registarEntrada(req.body);
            res.status(201).json({
                message: "Entrada de stock registada com sucesso!",
                dados: resultado
            });
        } catch (error) { next(error); }
    }

    // POST /estoque/saida
    async saida(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const estoqueService = new EstoqueService();
            const resultado = await estoqueService.registarSaidaFEFO(req.body);
            res.status(200).json(resultado);
        } catch (error) { next(error); }
    }
}