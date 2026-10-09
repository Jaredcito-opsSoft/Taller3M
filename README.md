# 📘 DOCUMENTACIÓN COMPLETA DEL SISTEMA DE COMERCIO ELECTRÓNICO (TALLER3M)

> Actividad 2.6: la especificación del dashboard, endpoint analítico, arquitectura, instalación y evidencias está disponible en [`docs/ACTIVIDAD_2_6.md`](docs/ACTIVIDAD_2_6.md).

Este documento contiene la especificación completa, arquitectura, manual técnico, modelo de datos, sistema de diseño y guía de uso del sistema e-commerce desarrollado bajo **Arquitectura Hexagonal** en el Backend y **Diseño Modular** en el Frontend.

---

## 1. 🌐 VISIÓN GENERAL DEL PROYECTO
El proyecto **Taller3M** es una plataforma web de comercio electrónico tipo SPA (Single Page Application) que permite la gestión de usuarios, productos, carrito de compras, catálogo visual con tarjetas HD y control de pedidos según el rol del usuario autenticado (**ADMIN** o **CLIENTE**).

* **Backend**: Node.js + Express + PostgreSQL (Puerto `3000`)
* **Frontend**: React + Vite (Puerto `5174`)
* **Base de Datos**: PostgreSQL (`ecommerce_db`)
* **Sistema de Diseño UI/UX**: Minimalista Oscuro Moderno (Zero Gradients: #0f0f12, #18181c, #2c2c34, botones planos sólidos)
* **Seguridad de Acceso**: Captcha visual alfanumérico de palabras y validación de seguridad.

---

## 2. 🏛️ ARQUITECTURA DEL BACKEND (HEXAGONAL / PUERTOS Y ADAPTADORES)

El servidor backend está estructurado estrictamente en `~/Taller3M/src` siguiendo la Arquitectura Hexagonal para aislar la lógica de negocio de los detalles de infraestructura:

```
src/
├── domain/                    # Capa de Dominio (Núcleo de Negocio)
│   ├── entities/              # Entidades puras con validaciones
│   │   ├── User.js            # Entidad Usuario
│   │   ├── Product.js         # Entidad Producto (incluye imagen_url)
│   │   └── Order.js           # Entidad Pedido e Items
│   ├── userRepository.js      # Puerto/Interfaz abstracta de Usuario
│   └── ...
├── application/               # Capa de Aplicación (Casos de Uso)
│   ├── userService.js         # Lógica de negocio de Usuarios y Login
│   ├── productService.js      # Lógica de negocio de Productos
│   └── orderService.js        # Lógica de creación y actualización de Pedidos
├── infrastructure/            # Capa de Infraestructura (Adaptadores Externos)
│   ├── db.js                  # Pool de conexiones a PostgreSQL (pg)
│   └── repositories/          # Adaptadores de persisencia PostgreSQL
│       ├── pgUserRepository.js # Repositorio de Usuarios en SQL
│       ├── pgProductRepository.js# Repositorio de Productos en SQL
│       └── pgOrderRepository.js# Repositorio de Pedidos en SQL
├── interfaces/                # Capa de Interfaces (Adaptadores de Entrada HTTP)
│   ├── userController.js      # Endpoints HTTP para Usuarios y Login
│   ├── productController.js   # Endpoints HTTP para Productos
│   └── orderController.js     # Endpoints HTTP para Pedidos
└── server.js                  # Punto de entrada de la aplicación Express
```

---

## 3. 🗄️ ESTRUCTURA Y MODELO DE BASE DE DATOS (POSTGRESQL `ecommerce_db`)

La base de datos relacional `ecommerce_db` cuenta con 4 tablas interconectadas:

### Tabla `usuarios`
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Identificador único del usuario |
| `nombre` | `VARCHAR(100)` | `NOT NULL` | Nombre completo del usuario |
| `email` | `VARCHAR(150)` | `UNIQUE, NOT NULL` | Correo electrónico de acceso |
| `password` | `TEXT` | `NOT NULL` | Contraseña cifrada con hash `bcrypt` |
| `rol` | `VARCHAR(20)` | `CHECK(rol IN ('ADMIN', 'CLIENTE'))` | Rol asignado |
| `creado_en` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Fecha de creación |

### Tabla `productos`
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Identificador único del producto |
| `nombre` | `VARCHAR(120)` | `NOT NULL` | Nombre comercial del producto |
| `descripcion` | `TEXT` | - | Detalles y especificaciones técnicas |
| `precio` | `NUMERIC(10,2)` | `CHECK(precio >= 0)` | Precio unitario en MXN |
| `stock` | `INTEGER` | `CHECK(stock >= 0)` | Unidades disponibles en inventario |
| `imagen_url` | `TEXT` | - | URL de la imagen en alta definición |
| `creado_en` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Fecha de registro |

### Tabla `pedidos`
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Identificador de la orden |
| `usuario_id` | `INTEGER` | `FOREIGN KEY (usuarios.id)` | ID del cliente solicitante |
| `total` | `NUMERIC(10,2)` | `NOT NULL` | Suma total del pedido en MXN |
| `estado` | `VARCHAR(20)` | `CHECK(estado IN ('PENDIENTE', 'PAGADO', 'CANCELADO'))` | Estado del pedido |
| `creado_en` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Fecha de emisión |

### Tabla `pedido_items`
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Identificador del ítem |
| `pedido_id` | `INTEGER` | `FOREIGN KEY (pedidos.id)` | Referencia al pedido encabezado |
| `producto_id` | `INTEGER` | `FOREIGN KEY (productos.id)` | Referencia al producto comprado |
| `cantidad` | `INTEGER` | `NOT NULL` | Cantidad comprada |
| `precio_unitario` | `NUMERIC(10,2)` | `NOT NULL` | Precio al momento de la compra |
| `subtotal` | `NUMERIC(10,2)` | `NOT NULL` | `cantidad * precio_unitario` |

---

## 4. 🔌 ENDPOINTS DE LA API REST (EXPRESS)

### 🔑 Autenticación y Usuarios (`/api/usuarios`)
* `POST /api/usuarios/login`: Valida email y contraseña cifrada con `bcrypt`. Si es exitoso, retorna `{ id, nombre, email, rol }`. Si es fallido, retorna HTTP `401`.
* `GET /api/usuarios`: Devuelve lista de todos los usuarios (sin contraseñas).
* `POST /api/usuarios`: Registra un nuevo usuario con hash de contraseña.
* `PUT /api/usuarios/:id`: Actualiza nombre, email o rol de un usuario.
* `DELETE /api/usuarios/:id`: Elimina un usuario.

### 📦 Productos (`/api/productos`)
* `GET /api/productos`: Lista todos los productos incluyendo sus imágenes y stock.
* `GET /api/productos/:id`: Obtiene el detalle de un producto específico.
* `POST /api/productos`: Crea un producto (`nombre`, `descripcion`, `precio`, `stock`, `imagen_url`).
* `PUT /api/productos/:id`: Actualiza un producto.
* `DELETE /api/productos/:id`: Elimina un producto.

### 🛒 Pedidos (`/api/pedidos`)
* `GET /api/pedidos`: Lista todos los pedidos con sus ítems detallados y nombre de cliente.
* `POST /api/pedidos`: Registra un pedido con sus ítems, disminuye el stock en PostgreSQL y calcula el total.
* `PUT /api/pedidos/:id/estado`: Actualiza el estado (`PENDIENTE`, `PAGADO`, `CANCELADO`).

---

## 5. 💻 ARQUITECTURA Y MÓDULOS DEL FRONTEND (REACT + VITE)

El frontend está ubicado en `~/Taller3M/frontend/src/modules/` y se organiza en módulos autónomos:

### 🔐 Módulo `auth`
* `services/authService.js`: Conexión con endpoints `/login` y `/usuarios`.
* `hooks/useAuth.js`: Gestión del estado del usuario autenticado en `localStorage`.
* `components/AuthView.jsx`: Pantalla de Login / Registro con **Captcha de Palabras / Código de Seguridad Alfanumérico** y algoritmo de verificación case-insensitive.

### 👥 Módulo `users`
* `services/userService.js`: CRUD de Usuarios.
* `hooks/useUsers.js`: Estado y notificadores de operaciones con usuarios.
* `components/UserForm.jsx` & `UserTable.jsx`: Componentes administrativos.

### 📦 Módulo `products`
* `services/productService.js`: Consumo del catálogo.
* `hooks/useProducts.js`: Carga y mutación de productos.
* `components/ProductForm.jsx`: Formulario con campo para URL de imagen y vista previa instantánea.
* `components/ProductTable.jsx`: Presentación de productos con alternador interactivo entre **🔲 Grid de Tarjetas con Imagen HD** y **☰ Tabla Detallada**.

### 🛒 Módulo `orders`
* `services/orderService.js`: Creación y consulta de pedidos.
* `hooks/useOrders.js`: Lógica de carrito, totales y estado de pedidos.
* `components/OrderForm.jsx`: Carrito interactivo con vista previa de imagen, recomendador, validación estricta de stock disponible e importe total.
* `components/OrderTable.jsx`: Listado de pedidos con Badges de Estado y selector interactivo para Administradores.

---

## 6. 🔒 CONTROL DE ACCESO BASADO EN ROLES (RBAC)

El sistema adapta la interfaz y permisos dinámicamente según el rol:

| Funcionalidad / Vista | Rol ADMINISTRADOR | Rol CLIENTE |
| :--- | :---: | :---: |
| **Inicio de Sesión y Captcha de Seguridad** | ✅ Requerido | ✅ Requerido |
| **Gestión de Usuarios (CRUD)** | ✅ Acceso completo | ❌ Denegado |
| **Catálogo de Productos** | ✅ Ver, Crear, Eliminar | 👁️ Solo lectura |
| **Creación de Pedidos / Carrito** | ❌ No disponible | ✅ Asociado a su ID |
| **Consulta de Pedidos** | 🌐 Todos los pedidos | 🔒 Solo sus pedidos |
| **Cambio de Estado de Pedidos** | ✅ (PENDIENTE / PAGADO / CANCELADO) | ❌ Denegado |

---

## 7. 🚀 GUÍA DE INSTALACIÓN Y EJECUCIÓN

### Requisitos Previos
* Node.js v18+ instalado.
* Servicio de PostgreSQL en ejecución en WSL (`sudo service postgresql start`).

### 1. Iniciar Servidor Backend
```bash
cd ~/Taller3M
npm run dev # O bien: node src/server.js
```
El servidor backend iniciará en: `http://localhost:3000`

### 2. Iniciar Servidor Frontend
```bash
cd ~/Taller3M/frontend
npm run dev
```
La aplicación web se ejecutará en: `http://localhost:5174`

---

## 8. 🧪 CUENTAS DE PRUEBA Y CATÁLOGO REGISTRADO

### Cuentas de Acceso Preconfiguradas:
* **Cliente de prueba**:
  - Email: `jaredcito@hospital.com`
  - Rol: `CLIENTE`
* **Administrador**:
  - Se puede registrar un usuario con rol `ADMIN` en la pestaña **Crear Cuenta** del Inicio de Sesión.

### Catálogo de 20 Productos Sembrados:
El sistema cuenta con 20 productos tecnológicos pre-registrados con imágenes HD en PostgreSQL.
