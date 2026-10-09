import { useCallback, useEffect, useState } from 'react';
import { getDashboardReport } from '../services/analyticsService';

export function useAnalytics(token, filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) {
      setError('Inicia sesion nuevamente para consultar los reportes.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      setData(await getDashboardReport(filters, token));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [token, filters.desde, filters.hasta, filters.agrupacion, filters.limite]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
