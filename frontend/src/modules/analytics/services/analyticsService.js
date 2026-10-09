const API_URL = 'http://localhost:3000/api/reportes';

export async function getDashboardReport(filters, token) {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_URL}?${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'No fue posible cargar el reporte analitico.');
  }
  return data;
}
