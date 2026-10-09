const jwt = require('jsonwebtoken');

class JwtTokenAdapter {
  constructor(secret, expiresIn = '8h') {
    if (!secret) throw new Error('JWT_SECRET es obligatorio para iniciar la aplicacion.');
    this.secret = secret;
    this.expiresIn = expiresIn;
  }

  sign(user) {
    return jwt.sign(
      { sub: String(user.id), rol: user.rol, email: user.email, nombre: user.nombre },
      this.secret,
      { expiresIn: this.expiresIn }
    );
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }

  requireAdmin() {
    return (req, res, next) => {
      const authorization = req.headers.authorization || '';
      const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

      if (!token) return res.status(401).json({ error: 'Autenticacion requerida.' });

      try {
        const user = this.verify(token);
        if (user.rol !== 'ADMIN') {
          return res.status(403).json({ error: 'Acceso exclusivo para administradores.' });
        }
        req.auth = user;
        return next();
      } catch {
        return res.status(401).json({ error: 'Token invalido o expirado.' });
      }
    };
  }
}

module.exports = JwtTokenAdapter;
