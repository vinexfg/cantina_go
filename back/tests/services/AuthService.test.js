import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../repositories/UsuarioRepository.js', () => ({
  default: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    setTokenVerificacao: vi.fn(),
    findByTokenVerificacao: vi.fn(),
    verificarEmail: vi.fn(),
    setTokenReset: vi.fn(),
    findByTokenReset: vi.fn(),
    limparTokenReset: vi.fn(),
    updateSenha: vi.fn(),
    incrementTokenVersion: vi.fn(),
  }
}));

vi.mock('../../repositories/CantinaRepository.js', () => ({
  default: { findByEmail: vi.fn() }
}));

vi.mock('../../repositories/ReservaRepository.js', () => ({
  default: { deleteAllByUsuario: vi.fn() }
}));

vi.mock('../../services/UsuarioService.js', () => ({
  default: { criar: vi.fn() }
}));

vi.mock('../../services/CantinaService.js', () => ({
  default: { criar: vi.fn() }
}));

vi.mock('../../services/EmailService.js', () => ({
  default: { enviarVerificacao: vi.fn(), enviarResetSenha: vi.fn() }
}));

vi.mock('../../repositories/LoginAttemptsRepository.js', () => ({
  default: {
    checkLockout: vi.fn().mockResolvedValue(null),
    recordFailure: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  }
}));

vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  }
}));

vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn(() => 'fake-token') }
}));

vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn(() => ({ toString: () => 'abc123token' })),
    randomInt: vi.fn(() => 123456),
  }
}));

import UsuarioRepository from '../../repositories/UsuarioRepository.js';
import CantinaRepository from '../../repositories/CantinaRepository.js';
import ReservaRepository from '../../repositories/ReservaRepository.js';
import UsuarioService from '../../services/UsuarioService.js';
import CantinaService from '../../services/CantinaService.js';
import EmailService from '../../services/EmailService.js';
import LoginAttemptsRepository from '../../repositories/LoginAttemptsRepository.js';
import bcrypt from 'bcrypt';
import AuthService from '../../services/AuthService.js';
import ValidationException from '../../exceptions/ValidationException.js';
import NotFoundException from '../../exceptions/NotFoundException.js';
import UnauthorizedException from '../../exceptions/UnauthorizedException.js';

const rowUsuario = { id: 'u1', nome: 'João', email: 'joao@escola.br', senha: '$hashed', token_version: 0, email_verificado: true };
const rowCantina = { id: 'c1', nome: 'Cantina A', email: 'cantina@escola.br', senha: '$hashed', token_version: 0 };

beforeEach(() => { vi.clearAllMocks(); });

describe('AuthService.loginUsuario', () => {
  it('retorna token e dados do usuario em login válido', async () => {
    UsuarioRepository.findByEmail.mockResolvedValue(rowUsuario);
    bcrypt.compare.mockResolvedValue(true);
    const result = await AuthService.loginUsuario('joao@escola.br', '12345678');
    expect(result.token).toBe('fake-token');
    expect(result.usuario.id).toBe('u1');
  });

  it('lança UnauthorizedException para email inexistente', async () => {
    UsuarioRepository.findByEmail.mockResolvedValue(null);
    await expect(AuthService.loginUsuario('x@x.com', '12345678')).rejects.toThrow(UnauthorizedException);
  });

  it('lança UnauthorizedException para senha errada', async () => {
    UsuarioRepository.findByEmail.mockResolvedValue(rowUsuario);
    bcrypt.compare.mockResolvedValue(false);
    await expect(AuthService.loginUsuario('joao@escola.br', 'errada')).rejects.toThrow(UnauthorizedException);
  });

  it('lança ValidationException quando email está vazio', async () => {
    await expect(AuthService.loginUsuario('', '12345678')).rejects.toThrow(ValidationException);
  });

  it('lança ValidationException quando senha está vazia', async () => {
    await expect(AuthService.loginUsuario('joao@escola.br', '')).rejects.toThrow(ValidationException);
  });
});

describe('AuthService.loginCantina', () => {
  it('retorna token e dados da cantina em login válido', async () => {
    CantinaRepository.findByEmail.mockResolvedValue(rowCantina);
    bcrypt.compare.mockResolvedValue(true);
    const result = await AuthService.loginCantina('cantina@escola.br', '12345678');
    expect(result.token).toBe('fake-token');
    expect(result.cantina.id).toBe('c1');
  });

  it('lança UnauthorizedException para email inexistente', async () => {
    CantinaRepository.findByEmail.mockResolvedValue(null);
    await expect(AuthService.loginCantina('x@x.com', '12345678')).rejects.toThrow(UnauthorizedException);
  });
});

describe('AuthService.registrarUsuario', () => {
  it('cria usuario, gera token e dispara email de verificacao', async () => {
    UsuarioService.criar.mockResolvedValue({ id: 'u2', email: 'novo@escola.br', token_version: 0 });
    UsuarioRepository.setTokenVerificacao.mockResolvedValue();
    EmailService.enviarVerificacao.mockResolvedValue();
    const result = await AuthService.registrarUsuario({ nome: 'Novo', email: 'novo@escola.br', senha: '12345678' });
    expect(result.token).toBe('fake-token');
    expect(UsuarioService.criar).toHaveBeenCalledOnce();
  });
});

describe('AuthService.verificarEmail', () => {
  it('verifica email com token válido', async () => {
    UsuarioRepository.findByTokenVerificacao.mockResolvedValue(rowUsuario);
    UsuarioRepository.verificarEmail.mockResolvedValue();
    const result = await AuthService.verificarEmail('valid-token');
    expect(result.message).toContain('verificado');
    expect(UsuarioRepository.verificarEmail).toHaveBeenCalledWith('u1');
  });

  it('lança NotFoundException para token inválido', async () => {
    UsuarioRepository.findByTokenVerificacao.mockResolvedValue(null);
    await expect(AuthService.verificarEmail('bad-token')).rejects.toThrow(NotFoundException);
  });
});

describe('AuthService.solicitarResetSenha', () => {
  it('gera token e envia email para email cadastrado', async () => {
    UsuarioRepository.findByEmail.mockResolvedValue(rowUsuario);
    UsuarioRepository.setTokenReset.mockResolvedValue();
    EmailService.enviarResetSenha.mockResolvedValue();
    await AuthService.solicitarResetSenha('joao@escola.br');
    expect(UsuarioRepository.setTokenReset).toHaveBeenCalledOnce();
    expect(EmailService.enviarResetSenha).toHaveBeenCalledOnce();
  });

  it('não faz nada para email não cadastrado (sem revelar existência)', async () => {
    UsuarioRepository.findByEmail.mockResolvedValue(null);
    await AuthService.solicitarResetSenha('nao@existe.com');
    expect(UsuarioRepository.setTokenReset).not.toHaveBeenCalled();
    expect(EmailService.enviarResetSenha).not.toHaveBeenCalled();
  });
});

describe('AuthService.resetarSenha', () => {
  it('redefine senha com token válido', async () => {
    UsuarioRepository.findByTokenReset.mockResolvedValue(rowUsuario);
    bcrypt.hash.mockResolvedValue('$novo_hash');
    UsuarioRepository.updateSenha.mockResolvedValue();
    UsuarioRepository.incrementTokenVersion.mockResolvedValue(1);
    UsuarioRepository.limparTokenReset.mockResolvedValue();
    const result = await AuthService.resetarSenha('valid-token', 'novaSenha123');
    expect(result.message).toContain('redefinida');
    expect(UsuarioRepository.updateSenha).toHaveBeenCalledWith('u1', '$novo_hash');
    expect(UsuarioRepository.incrementTokenVersion).toHaveBeenCalledWith('u1');
  });

  it('lança NotFoundException para token inválido', async () => {
    UsuarioRepository.findByTokenReset.mockResolvedValue(null);
    await expect(AuthService.resetarSenha('bad-token', 'novaSenha123')).rejects.toThrow(NotFoundException);
  });

  it('lança ValidationException para senha curta', async () => {
    await expect(AuthService.resetarSenha('qualquer', 'curta')).rejects.toThrow(ValidationException);
  });
});

describe('AuthService.excluirConta', () => {
  it('exclui conta com senha correta', async () => {
    UsuarioRepository.findById.mockResolvedValue(rowUsuario);
    bcrypt.compare.mockResolvedValue(true);
    ReservaRepository.deleteAllByUsuario.mockResolvedValue();
    UsuarioRepository.delete.mockResolvedValue();
    await AuthService.excluirConta('u1', '12345678');
    expect(UsuarioRepository.delete).toHaveBeenCalledWith('u1');
  });

  it('lança ValidationException para senha incorreta', async () => {
    UsuarioRepository.findById.mockResolvedValue(rowUsuario);
    bcrypt.compare.mockResolvedValue(false);
    await expect(AuthService.excluirConta('u1', 'errada')).rejects.toThrow(ValidationException);
  });

  it('lança NotFoundException para usuário inexistente', async () => {
    UsuarioRepository.findById.mockResolvedValue(null);
    await expect(AuthService.excluirConta('u1', '12345678')).rejects.toThrow(NotFoundException);
  });
});

describe('AuthService._checkLockout / _recordFailedAttempt', () => {
  it('bloqueia quando LoginAttemptsRepository retorna lockedUntil no futuro', async () => {
    LoginAttemptsRepository.checkLockout.mockResolvedValue(new Date(Date.now() + 60000));
    await expect(AuthService.loginUsuario('x@x.com', 'errado')).rejects.toThrow(/bloqueada/);
  });

  it('registra falha ao logar com email inexistente', async () => {
    LoginAttemptsRepository.checkLockout.mockResolvedValue(null);
    UsuarioRepository.findByEmail.mockResolvedValue(null);
    await AuthService.loginUsuario('x@x.com', 'errado').catch(() => {});
    expect(LoginAttemptsRepository.recordFailure).toHaveBeenCalledWith('x@x.com', 5, expect.any(Number));
  });
});
