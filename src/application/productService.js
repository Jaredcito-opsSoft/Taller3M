const Product = require('../domain/entities/Product');

class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async getAllProducts() {
    return await this.productRepository.findAll();
  }

  async getProductById(id) {
    return await this.productRepository.findById(id);
  }

  async createProduct(data) {
    const product = new Product(data);
    product.validar();
    return await this.productRepository.create(product);
  }

  async updateProduct(id, data) {
    const product = new Product({ id, ...data });
    product.validar();
    return await this.productRepository.update(id, product);
  }

  async deleteProduct(id) {
    return await this.productRepository.delete(id);
  }
}

module.exports = ProductService;