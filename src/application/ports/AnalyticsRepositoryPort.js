/**
 * Puerto de salida para consultas analiticas.
 * La capa de aplicacion no conoce PostgreSQL ni sentencias SQL.
 */
class AnalyticsRepositoryPort {
  async getSummary() {
    throw new Error('getSummary debe ser implementado por un adaptador.');
  }

  async getRevenueTrend() {
    throw new Error('getRevenueTrend debe ser implementado por un adaptador.');
  }

  async getOrderStatusDistribution() {
    throw new Error('getOrderStatusDistribution debe ser implementado por un adaptador.');
  }

  async getTopProducts() {
    throw new Error('getTopProducts debe ser implementado por un adaptador.');
  }
}

module.exports = AnalyticsRepositoryPort;
