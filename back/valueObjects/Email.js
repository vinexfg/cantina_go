class Email {
  constructor(value) {
    this.validate(value);
    this.value = value.toLowerCase().trim();
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
