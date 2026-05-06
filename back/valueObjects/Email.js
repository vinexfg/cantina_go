class Email {
  constructor(value) {
    const normalizado = value ? value.toLowerCase().trim() : value;
    this.validate(normalizado);
    this.value = normalizado;
  }

  validate(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error(`Email inválido: ${value}`);
    }
  }

  toString() {
    return this.value;
  }

  equals(other) {
    if (!(other instanceof Email)) return false;
    return this.value === other.value;
  }

  toJSON() {
    return this.value;
  }
}

export default Email;
