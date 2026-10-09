require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. Adaptador de base de datos
const pool = require('./infrastructure/db');

// 2. Repositorios (Adaptadores de salida)
const PgUserRepository = require('./infrastructure/repositories/pgUserRepository');
const PgProductRepository = require('./infrastructure/repositories/pgProductRepository');
const PgOrderRepository = require('./infrastructure/repositories/pgOrderRepository');
const PgAnalyticsRepository = require('./infrastructure/repositories/pgAnalyticsRepository');
const NodemailerAdapter = require('./infrastructure/email/NodemailerAdapter');
const JwtTokenAdapter = require('./infrastructure/auth/JwtTokenAdapter');

// 3. Servicios (Capa de aplicacion)
const UserService = require('./application/userService');
const ProductService = require('./application/productService');
const OrderService = require('./application/orderService');
const OrderNotificationService = require('./application/orderNotificationService');
const AnalyticsService = require('./application/analyticsService');

// 4. Controladores (Adaptadores de entrada)
const UserController = require('./interfaces/userController');
const ProductController = require('./interfaces/productController');
const OrderController = require('./interfaces/orderController');
const AnalyticsController = require('./interfaces/analyticsController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inyeccion de dependencias
const userRepo = new PgUserRepository();
const productRepo = new PgProductRepository();
const orderRepo = new PgOrderRepository();
const analyticsRepo = new PgAnalyticsRepository();
const emailAdapter = NodemailerAdapter.fromEnvironment();
const tokenAdapter = new JwtTokenAdapter(process.env.JWT_SECRET);
const orderNotificationService = new OrderNotificationService(emailAdapter, {
  adminEmail: process.env.ADMIN_EMAIL,
  paymentInstructions: process.env.PAYMENT_INSTRUCTIONS || 'Realiza tu pago por transferencia y conserva tu comprobante.'
});

const userService = new UserService(userRepo);
const productService = new ProductService(productRepo);
const orderService = new OrderService(orderRepo, orderNotificationService);
const analyticsService = new AnalyticsService(analyticsRepo);

const userController = new UserController(userService, tokenAdapter);
const productController = new ProductController(productService);
const orderController = new OrderController(orderService);
const analyticsController = new AnalyticsController(analyticsService);

// Comprobacion de estado
app.get('/', (req, res) => {
  res.json({ mensaje: 'API E-commerce con Arquitectura Hexagonal y PostgreSQL activa' });
});

// Rutas de Usuarios
app.post('/api/usuarios/login', (req, res) => userController.login(req, res));
app.get('/api/usuarios', (req, res) => userController.getAll(req, res));
app.get('/api/usuarios/:id', (req, res) => userController.getById(req, res));
app.post('/api/usuarios', (req, res) => userController.create(req, res));
app.put('/api/usuarios/:id', (req, res) => userController.update(req, res));
app.delete('/api/usuarios/:id', (req, res) => userController.delete(req, res));

// Rutas de Productos
app.get('/api/productos', (req, res) => productController.getAll(req, res));
app.get('/api/productos/:id', (req, res) => productController.getById(req, res));
app.post('/api/productos', (req, res) => productController.create(req, res));
app.put('/api/productos/:id', (req, res) => productController.update(req, res));
app.delete('/api/productos/:id', (req, res) => productController.delete(req, res));

// Rutas de Pedidos
app.get('/api/pedidos', (req, res) => orderController.getAll(req, res));
app.get('/api/pedidos/usuario/:usuarioId', (req, res) => orderController.getByUserId(req, res));
app.get('/api/pedidos/:id', (req, res) => orderController.getById(req, res));
app.post('/api/pedidos', (req, res) => orderController.create(req, res));
app.put('/api/pedidos/:id/estado', (req, res) => orderController.updateStatus(req, res));

// Reportes analiticos: acceso protegido exclusivamente para administradores.
app.get(
  '/api/reportes',
  tokenAdapter.requireAdmin(),
  (req, res) => analyticsController.getDashboard(req, res)
);

// Verificacion de conexion y arranque
pool.query('SELECT NOW()', (err, resDb) => {
  if (err) {
    console.error('Error conectando a PostgreSQL:', err.message);
  } else {
    console.log('Conexion a PostgreSQL establecida:', resDb.rows[0].now);
    app.listen(PORT, () => {
      console.log('Servidor ejecutandose en http://localhost:' + PORT);
      console.log('Arquitectura hexagonal de 3 entidades cargada correctamente.');
    });
  }
});
