const pool = require('../db');
const AnalyticsRepositoryPort = require('../../application/ports/AnalyticsRepositoryPort');

const REVENUE_STATES = ['PAGADO', 'ENVIADO'];
const STATUS_ORDER = ['PENDIENTE_DE_PAGO', 'PAGADO', 'ENVIADO', 'CANCELADO'];

class PgAnalyticsRepository extends AnalyticsRepositoryPort {
  constructor(database = pool) {
    super();
    this.database = database;
  }

  dateParams({ desde, hasta }) {
    return [desde, hasta];
  }

  async getSummary(filters) {
    const { rows } = await this.database.query(
      `SELECT
         COALESCE(SUM(total) FILTER (WHERE estado = ANY($3::text[])), 0)::numeric AS ingresos_totales,
         COUNT(*)::integer AS pedidos_totales,
         COUNT(*) FILTER (WHERE estado = 'PENDIENTE_DE_PAGO')::integer AS pedidos_pendientes,
         COALESCE(AVG(total) FILTER (WHERE estado = ANY($3::text[])), 0)::numeric AS ticket_promedio_pedido,
         COALESCE(
           SUM(total) FILTER (WHERE estado = ANY($3::text[])) /
           NULLIF(COUNT(DISTINCT usuario_id) FILTER (WHERE estado = ANY($3::text[])), 0),
           0
         )::numeric AS ticket_promedio_usuario,
         COUNT(DISTINCT usuario_id)::integer AS clientes_activos
       FROM pedidos
       WHERE creado_en >= $1::date
         AND creado_en < ($2::date + INTERVAL '1 day')`,
      [...this.dateParams(filters), REVENUE_STATES]
    );

    return this.mapNumbers(rows[0]);
  }

  async getRevenueTrend(filters) {
    const truncUnit = { dia: 'day', semana: 'week', mes: 'month' }[filters.agrupacion];
    const { rows } = await this.database.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('${truncUnit}', creado_en), 'YYYY-MM-DD') AS periodo,
         COALESCE(SUM(total), 0)::numeric AS ingresos,
         COUNT(*)::integer AS pedidos
       FROM pedidos
       WHERE creado_en >= $1::date
         AND creado_en < ($2::date + INTERVAL '1 day')
         AND estado = ANY($3::text[])
       GROUP BY DATE_TRUNC('${truncUnit}', creado_en)
       ORDER BY DATE_TRUNC('${truncUnit}', creado_en)`,
      [...this.dateParams(filters), REVENUE_STATES]
    );

    return rows.map((row) => this.mapNumbers(row));
  }

  async getOrderStatusDistribution(filters) {
    const { rows } = await this.database.query(
      `WITH estados(estado, posicion) AS (
         VALUES
           ('PENDIENTE_DE_PAGO', 1),
           ('PAGADO', 2),
           ('ENVIADO', 3),
           ('CANCELADO', 4)
       ), conteos AS (
         SELECT estado, COUNT(*)::integer AS cantidad
         FROM pedidos
         WHERE creado_en >= $1::date
           AND creado_en < ($2::date + INTERVAL '1 day')
         GROUP BY estado
       )
       SELECT e.estado,
              COALESCE(c.cantidad, 0)::integer AS cantidad,
              CASE WHEN SUM(COALESCE(c.cantidad, 0)) OVER () = 0 THEN 0
                   ELSE ROUND(
                     COALESCE(c.cantidad, 0)::numeric * 100 /
                     SUM(COALESCE(c.cantidad, 0)) OVER (),
                     2
                   )
              END AS porcentaje
       FROM estados e
       LEFT JOIN conteos c ON c.estado = e.estado
       ORDER BY e.posicion`,
      this.dateParams(filters)
    );

    const byStatus = new Map(rows.map((row) => [row.estado, this.mapNumbers(row)]));
    return STATUS_ORDER.map((status) => byStatus.get(status) || { estado: status, cantidad: 0, porcentaje: 0 });
  }

  async getTopProducts(filters) {
    const { rows } = await this.database.query(
      `SELECT pr.id AS producto_id,
              pr.nombre AS producto_nombre,
              SUM(pi.cantidad)::integer AS unidades_vendidas,
              COALESCE(SUM(pi.subtotal), 0)::numeric AS monto_recaudado
       FROM pedido_items pi
       JOIN pedidos p ON p.id = pi.pedido_id
       JOIN productos pr ON pr.id = pi.producto_id
       WHERE p.creado_en >= $1::date
         AND p.creado_en < ($2::date + INTERVAL '1 day')
         AND p.estado = ANY($3::text[])
       GROUP BY pr.id, pr.nombre
       ORDER BY unidades_vendidas DESC, monto_recaudado DESC
       LIMIT $4`,
      [...this.dateParams(filters), REVENUE_STATES, filters.limite]
    );

    return rows.map((row) => this.mapNumbers(row));
  }

  mapNumbers(row = {}) {
    return Object.fromEntries(Object.entries(row).map(([key, value]) => {
      if (['ingresos_totales', 'ticket_promedio_pedido', 'ticket_promedio_usuario', 'ingresos', 'porcentaje', 'monto_recaudado'].includes(key)) {
        return [key, Number(value || 0)];
      }
      return [key, value];
    }));
  }
}

module.exports = PgAnalyticsRepository;
