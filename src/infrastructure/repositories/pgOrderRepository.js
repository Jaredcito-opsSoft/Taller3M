const pool = require('../db');

class PgOrderRepository {
  async findAll() {
    const query = `
      SELECT p.id, p.usuario_id, u.nombre AS usuario_nombre, u.email AS usuario_email,
             p.total, p.estado, p.creado_en,
             COALESCE(
               json_agg(
                 json_build_object(
                   'producto_id', pi.producto_id,
                   'producto_nombre', pr.nombre,
                   'imagen_url', pr.imagen_url,
                   'cantidad', pi.cantidad,
                   'precio_unitario', pi.precio_unitario,
                   'subtotal', pi.subtotal
                 )
               ) FILTER (WHERE pi.id IS NOT NULL), '[]'
             ) AS items
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
      LEFT JOIN productos pr ON pi.producto_id = pr.id
      GROUP BY p.id, u.nombre, u.email
      ORDER BY p.id DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async findById(id) {
    const query = `
      SELECT p.id, p.usuario_id, u.nombre AS usuario_nombre, u.email AS usuario_email,
             p.total, p.estado, p.creado_en,
             COALESCE(
               json_agg(
                 json_build_object(
                   'producto_id', pi.producto_id,
                   'producto_nombre', pr.nombre,
                   'imagen_url', pr.imagen_url,
                   'cantidad', pi.cantidad,
                   'precio_unitario', pi.precio_unitario,
                   'subtotal', pi.subtotal
                 )
               ) FILTER (WHERE pi.id IS NOT NULL), '[]'
             ) AS items
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
      LEFT JOIN productos pr ON pi.producto_id = pr.id
      WHERE p.id = $1
      GROUP BY p.id, u.nombre, u.email
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async findByUserId(usuarioId) {
    const query = `
      SELECT p.id, p.usuario_id, u.nombre AS usuario_nombre, u.email AS usuario_email,
             p.total, p.estado, p.creado_en,
             COALESCE(
               json_agg(
                 json_build_object(
                   'producto_id', pi.producto_id,
                   'producto_nombre', pr.nombre,
                   'imagen_url', pr.imagen_url,
                   'cantidad', pi.cantidad,
                   'precio_unitario', pi.precio_unitario,
                   'subtotal', pi.subtotal
                 )
               ) FILTER (WHERE pi.id IS NOT NULL), '[]'
             ) AS items
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
      LEFT JOIN productos pr ON pi.producto_id = pr.id
      WHERE p.usuario_id = $1
      GROUP BY p.id, u.nombre, u.email
      ORDER BY p.id DESC
    `;
    const { rows } = await pool.query(query, [usuarioId]);
    return rows;
  }

  // Operación transaccional: verifica stock, inserta pedido e items y descuenta inventario
  async createTransaction(usuarioId, items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let totalCalculado = 0;
      const itemsProcesados = [];

      for (const item of items) {
        // Bloqueo de fila para evitar condiciones de carrera (Race Conditions)
        const prodRes = await client.query(
          'SELECT id, nombre, precio, stock, imagen_url FROM productos WHERE id = $1 FOR UPDATE',
          [item.producto_id]
        );

        if (prodRes.rows.length === 0) {
          throw new Error(`El producto con ID ${item.producto_id} no existe.`);
        }

        const producto = prodRes.rows[0];

        if (producto.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para el producto "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`
          );
        }

        const precioUnitario = parseFloat(producto.precio);
        const subtotal = parseFloat((precioUnitario * item.cantidad).toFixed(2));
        totalCalculado += subtotal;

        itemsProcesados.push({
          producto_id: producto.id,
          producto_nombre: producto.nombre,
          imagen_url: producto.imagen_url,
          cantidad: item.cantidad,
          precio_unitario: precioUnitario,
          subtotal
        });
      }

      totalCalculado = parseFloat(totalCalculado.toFixed(2));

      // 1. Insertar cabecera del Pedido
      const orderInsertRes = await client.query(
        `INSERT INTO pedidos (usuario_id, total, estado)
         VALUES ($1, $2, 'PENDIENTE_DE_PAGO')
         RETURNING id, usuario_id, total, estado, creado_en`,
        [usuarioId, totalCalculado]
      );
      const nuevoPedido = orderInsertRes.rows[0];

      // 2. Insertar cada detalle de producto y descontar el inventario
      for (const item of itemsProcesados) {
        await client.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [nuevoPedido.id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal]
        );

        await client.query(
          'UPDATE productos SET stock = stock - $1 WHERE id = $2',
          [item.cantidad, item.producto_id]
        );
      }

      await client.query('COMMIT');

      nuevoPedido.items = itemsProcesados;
      return nuevoPedido;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStatus(id, estado) {
    const query = 'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING id, estado';
    const { rows } = await pool.query(query, [estado, id]);
    return rows[0] || null;
  }
}

module.exports = PgOrderRepository;
