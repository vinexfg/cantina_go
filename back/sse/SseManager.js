class SseManager {
  #cantinas = new Map(); // cantina_id -> Set<res>
  #usuarios = new Map(); // usuario_id -> Set<res>

  add(tipo, id, res) {
    const map = tipo === 'cantina' ? this.#cantinas : this.#usuarios;
    if (!map.has(id)) map.set(id, new Set());
    map.get(id).add(res);
  }

  remove(tipo, id, res) {
    const map = tipo === 'cantina' ? this.#cantinas : this.#usuarios;
    const set = map.get(id);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) map.delete(id);
  }

  emit(tipo, id, evento, dados) {
    const map = tipo === 'cantina' ? this.#cantinas : this.#usuarios;
    const clientes = map.get(String(id));
    if (!clientes?.size) return;
    const payload = `event: ${evento}\ndata: ${JSON.stringify(dados)}\n\n`;
    const mortos = [];
    for (const res of clientes) {
      try { res.write(payload); } catch { mortos.push(res); }
    }
    mortos.forEach(res => this.remove(tipo, id, res));
  }
}

export default new SseManager();
