import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body; // Puxa os dados que o Next.js enviou

            // 1. Procurar o utilizador pelo e-mail
            const usuario = await prisma.user.findUnique({
                where: { email }
            });

            // 2. Se não encontrar ou estiver inativo, barra o acesso por segurança
            if (!usuario || !usuario.statusAtivo) {
                return res.status(401).json({ error: 'Credenciais inválidas. Verifica os teus dados.' });
            }

            // 3. Comparar a senha encriptada usando bcrypt
            const senhaValida = await bcrypt.compare(password, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ error: 'Credenciais inválidas. Verifica os teus dados.' });
            }

            // 4. Gerar o Token JWT (Muda a string 'SUA_CHAVE_SECRETA_JWT' para uma variável de ambiente .env depois)
            const token = jwt.sign(
                { id: usuario.id, perfil: usuario.perfil },
                process.env.JWT_SECRET || 'SUA_CHAVE_SECRETA_JWT',
                { expiresIn: '1d' } // Token expira em 1 dia
            );

            // 5. Retornar a estrutura exata que o teu frontend espera consumindo o teu model
            return res.status(200).json({
                token,
                user: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil // Envia o enum string ex: "COMPRAS_PROCUREMENT"
                }
            });

        } catch (error) {
            console.error('Erro no fluxo de autenticação:', error);
            return res.status(500).json({ error: 'Erro interno ao processar o login.' });
        }
    }
}