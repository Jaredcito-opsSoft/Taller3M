class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  async getAll(req, res) {
    try {
      const products = await this.productService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const product = await this.productService.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const created = await this.productService.createProduct(req.body);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await this.productService.updateProduct(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await this.productService.deleteProduct(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProductController;