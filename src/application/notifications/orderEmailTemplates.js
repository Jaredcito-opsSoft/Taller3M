const formatMoney = (value) => `$${Number(value || 0).toFixed(2)} MXN`;

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function itemsTable(items = []) {
  const rows = items.map((item) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(item.producto_nombre || item.nombre)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${Number(item.cantidad)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${formatMoney(item.precio_unitario)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${formatMoney(item.subtotal)}</td>
    </tr>`).join('');

  return `<table style="width:100%;border-collapse:collapse;margin:16px 0">
    <thead><tr style="background:#f3f4f6"><th style="padding:8px;text-align:left">Producto</th><th style="padding:8px">Cantidad</th><th style="padding:8px;text-align:right">Precio</th><th style="padding:8px;text-align:right">Subtotal</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function customerOrderEmail(order, paymentInstructions) {
  return {
    subject: `Confirmación de pedido #${order.id} - Pendiente de pago`,
    text: `Hola ${order.usuario_nombre}. Recibimos tu pedido #${order.id} por ${formatMoney(order.total)}. Estado: Pendiente de pago. ${paymentInstructions}`,
    html: `<main style="font-family:Arial,sans-serif;color:#111827;max-width:640px;margin:auto">
      <h1>¡Gracias por tu compra, ${escapeHtml(order.usuario_nombre)}!</h1>
      <p>Tu pedido <strong>#${order.id}</strong> fue registrado con estado <strong>Pendiente de pago</strong>.</p>
      ${itemsTable(order.items)}
      <p style="font-size:18px"><strong>Total: ${formatMoney(order.total)}</strong></p>
      <section style="background:#eff6ff;border-left:4px solid #2563eb;padding:12px"><strong>Instrucciones de pago</strong><br>${escapeHtml(paymentInstructions)}</section>
      <p>Cuando confirmemos el pago, actualizaremos el estado de tu pedido.</p>
    </main>`
  };
}

function adminOrderEmail(order) {
  return {
    subject: `Nuevo pedido #${order.id} pendiente de pago`,
    text: `Nuevo pedido #${order.id} de ${order.usuario_nombre} (${order.usuario_email}). Total: ${formatMoney(order.total)}.`,
    html: `<main style="font-family:Arial,sans-serif;color:#111827;max-width:640px;margin:auto">
      <h1>Nuevo pedido pendiente de pago</h1>
      <p><strong>Pedido:</strong> #${order.id}<br><strong>Cliente:</strong> ${escapeHtml(order.usuario_nombre)} (${escapeHtml(order.usuario_email)})</p>
      ${itemsTable(order.items)}
      <p style="font-size:18px"><strong>Total: ${formatMoney(order.total)}</strong></p>
    </main>`
  };
}

module.exports = { customerOrderEmail, adminOrderEmail };
