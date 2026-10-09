const ALLOWED_GROUPINGS = new Set(['dia', 'semana', 'mes']);

class AnalyticsService {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
  }

  async getDashboard(filters = {}) {
    const normalized = this.normalizeFilters(filters);

    const [summary, revenueTrend, orderStatuses, topProducts] = await Promise.all([
      this.analyticsRepository.getSummary(normalized),
      this.analyticsRepository.getRevenueTrend(normalized),
      this.analyticsRepository.getOrderStatusDistribution(normalized),
      this.analyticsRepository.getTopProducts(normalized)
    ]);

    return {
      filters: normalized,
      summary,
      revenueTrend,
      orderStatuses,
      topProducts,
      generatedAt: new Date().toISOString()
    };
  }

  normalizeFilters(filters) {
    const today = new Date();
    const defaultFrom = new Date(today);
    defaultFrom.setDate(defaultFrom.getDate() - 29);

    const desde = filters.desde || this.toDateInput(defaultFrom);
    const hasta = filters.hasta || this.toDateInput(today);
    const agrupacion = filters.agrupacion || 'dia';
    const limite = Number(filters.limite || 5);

    if (!this.isIsoDate(desde) || !this.isIsoDate(hasta)) {
      throw new Error('Las fechas deben usar el formato AAAA-MM-DD.');
    }
    if (desde > hasta) {
      throw new Error('La fecha inicial no puede ser posterior a la fecha final.');
    }
    if (!ALLOWED_GROUPINGS.has(agrupacion)) {
      throw new Error('La agrupacion debe ser dia, semana o mes.');
    }
    if (!Number.isInteger(limite) || limite < 1 || limite > 10) {
      throw new Error('El limite de productos debe ser un entero entre 1 y 10.');
    }

    return { desde, hasta, agrupacion, limite };
  }

  isIsoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }

  toDateInput(date) {
    return date.toISOString().slice(0, 10);
  }
}

module.exports = AnalyticsService;
