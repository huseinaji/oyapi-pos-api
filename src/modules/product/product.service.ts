import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private readonly model: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: CreateProductDto) {
    const productData = this.model.create(data);
    return this.model.save(productData);
  }

  findAll(query: QueryProductDto) {
    return this.model.findAndCount({ where: { ...query } });
  }

  async findOne(id: string) {
    const productData = await this.model.findOneBy({ id });
    return this.validateExisting(productData);
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    return await this.dataSource.transaction(async (t) => {
      const existingProduct = await t.findOne(Product, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!existingProduct) {
        throw new NotFoundException('Product not found');
      }
      const productData = t.merge(Product, existingProduct, data);
      return await t.save(productData);
    });
  }

  async remove(id: string): Promise<Product> {
    const existingUser = await this.findOne(id);
    return await this.model.remove(existingUser);
  }

  protected validateExisting(entity: Product | null): Product {
    if (!entity) throw new NotFoundException();
    return entity;
  }
}
