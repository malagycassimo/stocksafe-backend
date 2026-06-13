import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class UsuarioService {
    // CRIAR
    async execute(dados: any) {
        const usuarioExiste = await prisma.user.findUnique({
            where: { email: dados.email }
        });

        if (usuarioExiste) {
            throw new AppError('Este e-mail já está cadastrado no StockSafe.', 400);
        }

        const senhaCriptografada = await bcrypt.hash(dados.senha, 10);

        const novoUsuario = await prisma.user.create({
            data: {
                nome: dados.nome_completo,
                email: dados.email,
                senha: senhaCriptografada,
                telefone: dados.telefone,
                departamento: dados.departamento,
                cargo: dados.cargo,
                perfil: dados.perfil ?? "REQUISITANTE",
                permissoes: dados.permissoes,
                forcarTrocaSenha: dados.forcar_troca_senha ?? false,
                statusAtivo: dados.status_ativo ?? true,
                notificaEmail: dados.notificacao_email ?? true,
                notificaPush: dados.notificacao_push ?? false
            }
        });

        const { senha, ...usuarioSemSenha } = novoUsuario;
        return usuarioSemSenha;
    }


    // 🔍 LISTAR TODOS
    async listAll() {
        return await prisma.user.findMany({
            select: { id: true, nome: true, email: true, perfil: true, statusAtivo: true, departamento: true }
        });
    }

    // 🔍 BUSCAR POR ID
    async findById(id: string) {
        const usuario = await prisma.user.findUnique({ where: { id } });
        if (!usuario) throw new AppError('Utilizador não encontrado.', 404);

        const { senha, ...usuarioSemSenha } = usuario;
        return usuarioSemSenha;
    }

    // 🔄 ATUALIZAR
    async update(id: string, dados: any) {
        const usuario = await prisma.user.findUnique({ where: { id } });
        if (!usuario) throw new AppError('Utilizador não encontrado.', 404);

        if (dados.email && dados.email !== usuario.email) {
            const emailEmUso = await prisma.user.findUnique({ where: { email: dados.email } });
            if (emailEmUso) throw new AppError('Este e-mail já está a ser usado por outro utilizador.', 400);
        }

        if (dados.senha) {
            dados.senha = await bcrypt.hash(dados.senha, 10);
        }

        const usuarioAtualizado = await prisma.user.update({
            where: { id },
            data: {
                nome: dados.nome_completo,
                email: dados.email,
                senha: dados.senha,
                telefone: dados.telefone,
                departamento: dados.departamento,
                cargo: dados.cargo,
                perfil: dados.perfil,
                permissoes: dados.permissoes,
                forcarTrocaSenha: dados.forcar_troca_senha,
                statusAtivo: dados.status_ativo,
                notificaEmail: dados.notificacao_email,
                notificaPush: dados.notificacao_push
            }
        });

        const { senha, ...usuarioSemSenha } = usuarioAtualizado;
        return usuarioSemSenha;
    }

    // ❌ ELIMINAR
    async delete(id: string) {
        const usuario = await prisma.user.findUnique({ where: { id } });
        if (!usuario) throw new AppError('Utilizador não encontrado.', 404);

        await prisma.user.delete({ where: { id } });
        return { message: 'Utilizador removido com sucesso da plataforma.' };
    }

}