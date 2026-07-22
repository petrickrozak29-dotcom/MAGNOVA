import { PrismaClient } from '@prisma/client';
import { categoryService } from './categoryService';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Category Service', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return all categories if no featureType provided', async () => {
      const mockCategories = [{ id: '1', name: 'Alam', featureType: 'WISATA' }];
      prisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await categoryService.getCategories();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should return categories filtered by featureType', async () => {
      const mockCategories = [{ id: '2', name: 'Makanan Khas', featureType: 'KULINER' }];
      prisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await categoryService.getCategories('KULINER');

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { featureType: 'KULINER' },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const mockCategory = { id: '3', name: 'Taman Rekreasi', featureType: 'WISATA' };
      prisma.category.create.mockResolvedValue(mockCategory);

      const result = await categoryService.createCategory('Taman Rekreasi', 'WISATA');

      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Taman Rekreasi', featureType: 'WISATA' },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update a category name', async () => {
      const mockCategory = { id: '1', name: 'Wisata Alam', featureType: 'WISATA' };
      prisma.category.update.mockResolvedValue(mockCategory);

      const result = await categoryService.updateCategory('1', 'Wisata Alam');

      expect(prisma.category.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Wisata Alam' },
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      prisma.category.delete.mockResolvedValue({ id: '1' });

      await categoryService.deleteCategory('1');

      expect(prisma.category.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
