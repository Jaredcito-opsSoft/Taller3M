import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';

const STATUS_META = {
  PENDIENTE_DE_PAGO: { label: 'Pendiente', color: '#f59e0b' },
  PAGADO: { label: 'Pagado', color: '#22c55e' },
  ENVIADO: { label: 'Enviado', color: '#a78bfa' },
  CANCELADO: { label: 'Cancelado', color: '#ef4444' }
};

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2
});

const compactMoney = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  notation: 'compact',
  maximumFractionDigits: 1
});

function dateInput(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function presetRange(days) {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(desde.getDate() - (days - 1));
  return { desde: dateInput(desde), hasta: dateInput(hasta), agrupacion: days <= 31 ? 'dia' : 'semana', limite: 5 };
}

function monthRange() {
  const now = new Date();
  return {
    desde: dateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    hasta: dateInput(now),
    agrupacion: 'dia',
    limite: 5
  };
}

function AnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="analytics-tooltip">
      <span>{label}</span>
      <strong>{money.format(Number(payload[0].value || 0))}</strong>
    </div>
  );
}

export function AnalyticsDashboard({ usuario }) {
  const initial = useMemo(() => presetRange(30), []);
  const [draft, setDraft] = useState(initial);
  const [filters, setFilters] = useState(initial);
  const [preset, setPreset] = useState('30');
  const { data, loading, error, reload } = useAnalytics(usuario?.token, filters);

  const applyPreset = (value) => {
    const next = value === 'month' ? monthRange() : presetRange(Number(value));
    setPreset(value);
    setDraft(next);
    setFilters(next);
  };

  const applyCustom = (event) => {
    event.preventDefault();
    setPreset('custom');
    setFilters({ ...draft, limite: 5 });
  };

  const summary = data?.summary || {};
  const statusData = (data?.orderStatuses || []).map((item) => ({
    ...item,
    label: STATUS_META[item.estado]?.label || item.estado,
    color: STATUS_META[item.estado]?.color || '#71717a'
  }));
  const nonEmptyStatuses = statusData.filter((item) => Number(item.cantidad) > 0);

  return (
    <section className="analytics-dashboard" aria-labelledby="analytics-title">
      <header className="analytics-heading">
        <div>
          <span className="analytics-eyebrow">Pulso comercial</span>
          <h2 id="analytics-title">Dashboard de métricas</h2>
          <p>Ingresos confirmados, comportamiento de pedidos y rotación de productos.</p>
        </div>
        {data?.generatedAt && (
          <span className="analytics-updated">
            Actualizado {new Date(data.generatedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </header>

      <form className="analytics-filterbar" onSubmit={applyCustom}>
        <div className="analytics-presets" aria-label="Periodos rapidos">
          {[['7', '7 días'], ['30', '30 días'], ['month', 'Este mes']].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={preset === value ? 'active' : ''}
              onClick={() => applyPreset(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label>
          Desde
          <input type="date" value={draft.desde} max={draft.hasta} onChange={(event) => setDraft({ ...draft, desde: event.target.value })} />
        </label>
        <label>
          Hasta
          <input type="date" value={draft.hasta} min={draft.desde} onChange={(event) => setDraft({ ...draft, hasta: event.target.value })} />
        </label>
        <label>
          Agrupar
          <select value={draft.agrupacion} onChange={(event) => setDraft({ ...draft, agrupacion: event.target.value })}>
            <option value="dia">Por día</option>
            <option value="semana">Por semana</option>
            <option value="mes">Por mes</option>
          </select>
        </label>
        <button className="analytics-apply" type="submit">Aplicar</button>
      </form>

      {loading && (
        <div className="analytics-state" role="status">
          <span className="analytics-loader" />
          Calculando métricas en PostgreSQL…
        </div>
      )}

      {!loading && error && (
        <div className="analytics-state analytics-error" role="alert">
          <div><strong>No se pudo cargar el dashboard</strong><span>{error}</span></div>
          <button type="button" onClick={reload}>Reintentar</button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="analytics-kpis">
            <article className="kpi-card kpi-primary">
              <span>Ingresos confirmados</span>
              <strong>{money.format(Number(summary.ingresos_totales || 0))}</strong>
              <small>Pedidos pagados o enviados</small>
            </article>
            <article className="kpi-card">
              <span>Pedidos del periodo</span>
              <strong>{Number(summary.pedidos_totales || 0)}</strong>
              <small>{Number(summary.pedidos_pendientes || 0)} pendientes de pago</small>
            </article>
            <article className="kpi-card">
              <span>Ticket por pedido</span>
              <strong>{money.format(Number(summary.ticket_promedio_pedido || 0))}</strong>
              <small>Promedio de órdenes confirmadas</small>
            </article>
            <article className="kpi-card">
              <span>Ticket por usuario</span>
              <strong>{money.format(Number(summary.ticket_promedio_usuario || 0))}</strong>
              <small>{Number(summary.clientes_activos || 0)} clientes activos</small>
            </article>
          </div>

          <div className="analytics-chart-grid">
            <article className="analytics-panel revenue-panel">
              <div className="panel-heading">
                <div><h3>Tendencia de ingresos</h3><p>Ventas pagadas y enviadas por {filters.agrupacion}.</p></div>
                <span className="panel-total">{money.format(Number(summary.ingresos_totales || 0))}</span>
              </div>
              {data.revenueTrend.length ? (
                <div className="chart-frame" aria-label="Gráfico de tendencia de ingresos">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenueTrend} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#292932" vertical={false} />
                      <XAxis dataKey="periodo" stroke="#71717a" tickLine={false} axisLine={false} fontSize={11} minTickGap={24} />
                      <YAxis stroke="#71717a" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(value) => compactMoney.format(value)} width={68} />
                      <Tooltip content={<AnalyticsTooltip />} />
                      <Area type="monotone" dataKey="ingresos" stroke="#a78bfa" strokeWidth={2.5} fill="#8b5cf6" fillOpacity={0.14} activeDot={{ r: 5, fill: '#c4b5fd', stroke: '#18181c', strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : <div className="analytics-empty">No hay ingresos confirmados en este periodo.</div>}
            </article>

            <article className="analytics-panel status-panel">
              <div className="panel-heading"><div><h3>Estado de pedidos</h3><p>Distribución de todas las órdenes.</p></div></div>
              <div className="status-content">
                <div className="pie-frame" aria-label="Gráfico de estados de pedidos">
                  {nonEmptyStatuses.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={nonEmptyStatuses} dataKey="cantidad" nameKey="label" innerRadius={58} outerRadius={84} paddingAngle={3} stroke="none">
                          {nonEmptyStatuses.map((item) => <Cell key={item.estado} fill={item.color} />)}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} pedidos`, name]} contentStyle={{ background: '#18181c', border: '1px solid #34343e', borderRadius: 8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="pie-empty">0</div>}
                </div>
                <div className="status-legend">
                  {statusData.map((item) => (
                    <div key={item.estado}>
                      <span className="status-dot" style={{ backgroundColor: item.color }} />
                      <span>{item.label}</span>
                      <strong>{item.cantidad}</strong>
                      <small>{Number(item.porcentaje).toFixed(1)}%</small>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <article className="analytics-panel ranking-panel">
            <div className="panel-heading">
              <div><h3>Productos con mayor rotación</h3><p>Ranking por unidades vendidas; solo considera ventas confirmadas.</p></div>
              <span className="ranking-count">Top {data.topProducts.length}</span>
            </div>
            {data.topProducts.length ? (
              <div className="ranking-table-wrap">
                <table className="ranking-table">
                  <thead><tr><th>Posición</th><th>Producto</th><th>Unidades</th><th>Monto recaudado</th></tr></thead>
                  <tbody>
                    {data.topProducts.map((product, index) => (
                      <tr key={product.producto_id}>
                        <td><span className="rank-number">{String(index + 1).padStart(2, '0')}</span></td>
                        <td><strong>{product.producto_nombre}</strong><small>Producto #{product.producto_id}</small></td>
                        <td>{product.unidades_vendidas}</td>
                        <td>{money.format(Number(product.monto_recaudado || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="analytics-empty">No hay productos vendidos en este periodo.</div>}
          </article>
        </>
      )}
    </section>
  );
}
