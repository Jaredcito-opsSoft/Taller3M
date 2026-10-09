const test = require('node:test');
const assert = require('node:assert/strict');
const AnalyticsService = require('../src/application/analyticsService');

function repositoryStub(calls) {
  return {
    getSummary: async (filters) => { calls.push(['summary', filters]); return { ingresos_totales: 1250 }; },
    getRevenueTrend: async (filters) => { calls.push(['trend', filters]); return [{ periodo: '2026-10-01', ingresos: 1250 }]; },
    getOrderStatusDistribution: async (filters) => { calls.push(['statuses', filters]); return [{ estado: 'PAGADO', cantidad: 2, porcentaje: 100 }]; },
    getTopProducts: async (filters) => { calls.push(['products', filters]); return [{ producto_id: 1, unidades_vendidas: 3 }]; }
  };
}

test('consulta todas las proyecciones analiticas con filtros normalizados', async () => {
  const calls = [];
  const service = new AnalyticsService(repositoryStub(calls));

  const result = await service.getDashboard({
    desde: '2026-10-01',
    hasta: '2026-10-09',
    agrupacion: 'dia',
    limite: '5'
  });

  assert.equal(calls.length, 4);
  assert.deepEqual(calls[0][1], { desde: '2026-10-01', hasta: '2026-10-09', agrupacion: 'dia', limite: 5 });
  assert.equal(result.summary.ingresos_totales, 1250);
  assert.equal(result.topProducts.length, 1);
  assert.match(result.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('rechaza rangos de fechas y agrupaciones invalidas', async () => {
  const service = new AnalyticsService(repositoryStub([]));

  await assert.rejects(
    service.getDashboard({ desde: '2026-10-10', hasta: '2026-10-01' }),
    /fecha inicial/
  );
  await assert.rejects(
    service.getDashboard({ desde: '2026-10-01', hasta: '2026-10-10', agrupacion: 'hora' }),
    /agrupacion/
  );
});
