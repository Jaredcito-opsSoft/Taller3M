import { useState, useEffect } from 'react';

export function AuthView({ onLogin, onRegister }) {
  const [esLogin, setEsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'CLIENTE'
  });
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Word Captcha
  const [codigoCaptcha, setCodigoCaptcha] = useState('');
  const [respuestaCaptcha, setRespuestaCaptcha] = useState('');

  const generarPalabraCaptcha = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let palabra = '';
    for (let i = 0; i < 6; i++) {
      const idx = Math.floor(Math.random() * caracteres.length);
      palabra += caracteres.charAt(idx);
    }
    setCodigoCaptcha(palabra);
    setRespuestaCaptcha('');
  };

  useEffect(() => {
    generarPalabraCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (esLogin) {
      if (respuestaCaptcha.trim().toUpperCase() !== codigoCaptcha.toUpperCase()) {
        setMensaje({
          texto: 'Código de verificación incorrecto. Intenta nuevamente.',
          tipo: 'error'
        });
        generarPalabraCaptcha();
        return;
      }
    }

    setCargando(true);

    try {
      if (esLogin) {
        await onLogin({ email: formData.email, password: formData.password });
      } else {
        await onRegister({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: formData.rol
        });
      }
    } catch (err) {
      setMensaje({ texto: err.message || 'Error en el proceso', tipo: 'error' });
      if (esLogin) generarPalabraCaptcha();
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{esLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
          <p>
            {esLogin
              ? 'Introduce tus credenciales para acceder'
              : 'Completa los datos para registrar tu cuenta'}
          </p>
        </div>

        {mensaje.texto && (
          <div className={`alerta ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${esLogin ? 'active' : ''}`}
            onClick={() => {
              setEsLogin(true);
              setMensaje({ texto: '', tipo: '' });
              generarPalabraCaptcha();
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${!esLogin ? 'active' : ''}`}
            onClick={() => {
              setEsLogin(false);
              setMensaje({ texto: '', tipo: '' });
            }}
          >
            Crear Cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!esLogin && (
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Juan Pérez"
                required={!esLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nombre@ejemplo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {!esLogin && (
            <div className="form-group">
              <label htmlFor="rol">Rol</label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="form-select"
              >
                <option value="CLIENTE">CLIENTE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          )}

          {esLogin && (
            <div className="captcha-section">
              <div className="captcha-header-row">
                <span className="captcha-title">Verificación de seguridad</span>
              </div>

              <div className="captcha-box">
                <div className="captcha-characters">
                  {codigoCaptcha.split('').map((char, index) => {
                    const rotacion = (index % 2 === 0 ? 1 : -1) * ((index * 3) % 9);
                    return (
                      <span
                        key={index}
                        className="captcha-char"
                        style={{
                          transform: `rotate(${rotacion}deg)`
                        }}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="btn-refresh-captcha"
                  onClick={generarPalabraCaptcha}
                  title="Nuevo código"
                >
                  ↻
                </button>
              </div>

              <div className="form-group" style={{ marginTop: '0.4rem' }}>
                <input
                  type="text"
                  value={respuestaCaptcha}
                  onChange={(e) => setRespuestaCaptcha(e.target.value)}
                  placeholder="Introduce el código mostrado"
                  required
                  autoComplete="off"
                  className="captcha-input"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary full-width"
            disabled={cargando}
          >
            {cargando
              ? 'Procesando...'
              : esLogin
              ? 'Entrar'
              : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}