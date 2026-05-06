export const HISTORICO_DIAS = parseInt(process.env.HISTORICO_DIAS || '7', 10);

class AppConfig {
  constructor() {
    this.corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    this.port = process.env.PORT || 3000;
    this.host = process.env.HOST || '127.0.0.1';
    this.environment = process.env.NODE_ENV || 'development';
    this.jsonLimit = '10mb';
  }

  getCorsConfig() {
    return {
      origin: this.corsOrigin,
      credentials: true
    };
  }

  getExpressJsonConfig() {
    return { limit: this.jsonLimit };
  }

  getServerInfo() {
    return {
      url: `http://${this.host}:${this.port}`,
      port: this.port,
      host: this.host,
      environment: this.environment
    };
  }

  getBaseUrl() {
    return `http://${this.host}:${this.port}`;
  }
}

export default AppConfig;
