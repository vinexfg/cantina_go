import ReservaRepository from '../repositories/ReservaRepository.js';
import ProdutoRepository from '../repositories/ProdutoRepository.js';
import CantinaRepository from '../repositories/CantinaRepository.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import Reserva, { STATUS_VALIDOS } from '../valueObjects/Reserva.js';
import ReservaItem from '../valueObjects/ReservaItem.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import ValidationException from '../exceptions/ValidationException.js';
import ForbiddenException from '../exceptions/ForbiddenException.js';
import SseManager from '../sse/SseManager.js';
import EmailService from './EmailService.js';

class ReservaService {
  validarCantinaAutenticada(usuario, cantina_id) {
    if (!usuario || usuario.tipo !== 'cantina' || usuario.id !== String(cantina_id)) {
      throw new ForbiddenException('Você não pode acessar reservas de outra cantina');
    }
  }

  validarUsuarioAutenticado(usuario, usuario_id) {
    if (!usuario || usuario.tipo !== 'usuario' || usuario.id !== String(usuario_id)) {
      throw new ForbiddenException('Você não pode acessar reservas de outro usuário');
    }
  }

  validarAcessoReserva(usuario, reserva) {
    if (!usuario) {
      throw new ForbiddenException();
    }

    if (usuario.tipo === 'cantina' && usuario.id === String(reserva.cantina_id)) {
      return;
    }

    if (usuario.tipo === 'usuario' && usuario.id === String(reserva.usuario_id)) {
      return;
    }

    throw new ForbiddenException('Você não pode acessar esta reserva');
  }

  montarReservaComItens(row, itensRows) {
    const itens = itensRows.map(item => ({
      id: item.id,
      produto_id: item.produto_id,
      produto_nome: item.produto_nome,
      quantidade: item.quantidade,
      preco: parseFloat(item.produto_preco),
    }));
    const total = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

    return {
      ...Reserva.fromRow(row).toJSON(),
      usuario_nome: row.usuario_nome || null,
      criado_em: row.created_at,
      itens,
      total,
    };
  }

  async obterTodos(usuarioAutenticado = null) {
    if (!usuarioAutenticado || usuarioAutenticado.tipo !== 'cantina') {
      throw new ForbiddenException('Apenas cantinas podem listar reservas');
    }

    return this.obterPorCantina(usuarioAutenticado.id, usuarioAutenticado);
  }

  async obterPorId(id, usuarioAutenticado = null) {
    const reserva = await ReservaRepository.findById(id);
    if (!reserva) throw new NotFoundException('Reserva não encontrada');
    this.validarAcessoReserva(usuarioAutenticado, reserva);

    const itensRows = await ReservaRepository.findItensByReserva(id);
    const itens = itensRows.map(row => ReservaItem.fromRow(row).toJSON());
    return Reserva.fromRow(reserva, itens).toJSON();
  }

  async _popularItens(dados, total) {
    if (dados.length === 0) return { dados: [], total };

    const todosItens = await ReservaRepository.findItensByReservas(dados.map(r => r.id));

    const itensPorReserva = {};
    todosItens.forEach(item => {
      if (!itensPorReserva[item.reserva_id]) itensPorReserva[item.reserva_id] = [];
      itensPorReserva[item.reserva_id].push(item);
    });

    const reservas = dados.map(row =>
      this.montarReservaComItens(row, itensPorReserva[row.id] || [])
    );
    return { dados: reservas, total };
  }

  async obterPorCantina(cantina_id, usuarioAutenticado = null, { page, limit } = {}) {
    this.validarCantinaAutenticada(usuarioAutenticado, cantina_id);
    const { dados, total } = await ReservaRepository.findByCantina(cantina_id, { page, limit });
    return this._popularItens(dados, total);
  }

  async obterPorUsuario(usuario_id, usuarioAutenticado = null, { page, limit } = {}) {
    this.validarUsuarioAutenticado(usuarioAutenticado, usuario_id);
    const { dados, total } = await ReservaRepository.findByUsuario(usuario_id, { page, limit });
    return this._popularItens(dados, total);
  }

  async _validarEMontarItem(item, reserva) {
    const produto = await ProdutoRepository.findById(item.produto_id);
    if (!produto) {
      throw new ValidationException('Produto inválido', { produto_id: 'Produto não encontrado' });
    }
    if (produto.cantina_id !== reserva.cantina_id) {
      throw new ValidationException('Produto inválido', { produto_id: 'Produto não pertence à cantina selecionada' });
    }
    if (!produto.disponivel || produto.arquivado) {
      throw new ValidationException('Produto inválido', { produto_id: 'Produto indisponível para reserva' });
    }
    if (produto.quantidade_limite !== null && item.quantidade > Number(produto.quantidade_limite)) {
      throw new ValidationException('Quantidade inválida', {
        quantidade: `Quantidade máxima para ${produto.nome}: ${produto.quantidade_limite}`,
      });
    }
    return {
      id: item.id.toString(),
      produto_id: item.produto_id,
      quantidade: item.quantidade,
      nome_produto: produto.nome ?? null,
      preco_unitario: produto.preco ?? null,
    };
  }

  async criar(dados, usuarioAutenticado = null) {
    this.validarUsuarioAutenticado(usuarioAutenticado, dados.usuario_id);

    const cantina = await CantinaRepository.findById(dados.cantina_id);
    if (!cantina) throw new NotFoundException('Cantina não encontrada');

    if (cantina.horario_fechamento) {
      const agora = new Date();
      const local = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      const horaAtual = `${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}`;
      const abertura = cantina.horario_abertura || '00:00';
      if (horaAtual < abertura || horaAtual >= cantina.horario_fechamento) {
        throw new ValidationException(
          `A cantina está fechada. Horário de funcionamento: ${abertura} às ${cantina.horario_fechamento}`
        );
      }
    }

    const reserva = Reserva.criar(dados);
    const itensVO = dados.itens.map(item =>
      ReservaItem.criar({ ...item, reserva_id: reserva.id.toString() })
    );

    const reservaData = {
      id: reserva.id.toString(),
      cantina_id: reserva.cantina_id,
      usuario_id: reserva.usuario_id,
      status: reserva.status,
    };

    const itensData = await Promise.all(itensVO.map(item => this._validarEMontarItem(item, reserva)));

    const { reserva: criada, itens } = await ReservaRepository.createComItens(reservaData, itensData);
    const itensJSON = itens.map(row => ReservaItem.fromRow(row).toJSON());
    const resultado = Reserva.fromRow(criada, itensJSON).toJSON();

    SseManager.emit('cantina', resultado.cantina_id, 'nova_reserva', resultado);

    return resultado;
  }

  async obterHistorico(cantina_id, usuarioAutenticado = null, { page, limit } = {}) {
    this.validarCantinaAutenticada(usuarioAutenticado, cantina_id);
    const { dados, total } = await ReservaRepository.findHistoricoByCantina(cantina_id, { page, limit });
    return this._popularItens(dados, total);
  }

  async limparAntigas(usuarioAutenticado = null) {
    if (!usuarioAutenticado || usuarioAutenticado.tipo !== 'cantina') {
      throw new ForbiddenException('Apenas cantinas podem limpar reservas antigas');
    }

    const removidas = await ReservaRepository.deleteAntigasByCantina(usuarioAutenticado.id);
    return { removidas };
  }

  async limparAntigasUsuario(usuario_id, usuarioAutenticado = null) {
    this.validarUsuarioAutenticado(usuarioAutenticado, usuario_id);

    const removidas = await ReservaRepository.deleteAntigasUsuario(usuario_id);
    return { removidas };
  }

  async atualizarStatus(id, status, usuarioAutenticado = null) {
    if (!STATUS_VALIDOS.includes(status)) {
      throw new ValidationException(`Status inválido. Use: ${STATUS_VALIDOS.join(', ')}`);
    }
    const reserva = await ReservaRepository.findById(id);
    if (!reserva) throw new NotFoundException('Reserva não encontrada');
    this.validarCantinaAutenticada(usuarioAutenticado, reserva.cantina_id);

    await ReservaRepository.updateStatus(id, status);

    SseManager.emit('usuario', reserva.usuario_id, 'status_atualizado', { id, status });

    if (['confirmada', 'cancelada', 'concluida'].includes(status)) {
      const itensRows = await ReservaRepository.findItensByReserva(id);
      const itens = itensRows.map(r => ({ produto_nome: r.produto_nome || r.nome_produto, quantidade: r.quantidade, preco: parseFloat(r.preco_unitario || 0) }));
      const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
      UsuarioRepository.findById(reserva.usuario_id)
        .then(u => u && EmailService.enviarStatusReserva(u.email, { status, itens, total }))
        .catch(err => console.error('[Reserva] Falha ao enviar email de status:', err.message));
    }

    return { success: true };
  }

  async remover(id, usuarioAutenticado = null) {
    const reserva = await ReservaRepository.findById(id);
    if (!reserva) throw new NotFoundException('Reserva não encontrada');
    this.validarAcessoReserva(usuarioAutenticado, reserva);

    await ReservaRepository.delete(id);
  }
}

export default new ReservaService();
