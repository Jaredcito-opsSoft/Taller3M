class UserController {
  constructor(userService, tokenService = null) {
    this.userService = userService;
    this.tokenService = tokenService;
  }

  async getAll(req, res) {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await this.userService.login(email, password);
      const token = this.tokenService ? this.tokenService.sign(user) : null;
      res.json(token ? { ...user, token } : user);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const newUser = await this.userService.register(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await this.userService.updateUser(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await this.userService.deleteUser(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
