import { PrismaClient } from '@prisma/client';
import { smartMagelangService } from './smartMagelangService';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    category: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    smartMagelangContent: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Smart Magelang Service', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('getContentsByCategory', () => {
    it('should return all contents if no category is provided', async () => {
      const mockContents = [{ id: '1', title: 'Tech 1' }];
      prisma.smartMagelangContent.findMany.mockResolvedValue(mockContents);

      const result = await smartMagelangService.getContentsByCategory();

      expect(prisma.smartMagelangContent.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockContents);
    });

    it('should filter by category if provided', async () => {
      const mockContents = [{ id: '1', title: 'Tech 1' }];
      prisma.smartMagelangContent.findMany.mockResolvedValue(mockContents);

      const result = await smartMagelangService.getContentsByCategory('Infrastruktur');

      expect(prisma.smartMagelangContent.findMany).toHaveBeenCalledWith({
        where: { category: { name: 'Infrastruktur' } },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockContents);
    });
  });

  describe('createContent', () => {
    it('should create category if it does not exist and create content', async () => {
      const mockCategory = { id: 'cat-1', name: 'Infrastruktur', featureType: 'SMART_MAGELANG' };
      const mockContent = { id: 'content-1', title: 'Free WiFi' };

      prisma.category.findFirst.mockResolvedValue(null);
      prisma.category.create.mockResolvedValue(mockCategory);
      prisma.smartMagelangContent.create.mockResolvedValue(mockContent);

      const result = await smartMagelangService.createContent({
        title: 'Free WiFi',
        description: 'Internet publik',
        categoryName: 'Infrastruktur',
      });

      expect(prisma.category.findFirst).toHaveBeenCalledWith({
        where: { name: 'Infrastruktur', featureType: 'SMART_MAGELANG' },
      });
      expect(prisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Infrastruktur', featureType: 'SMART_MAGELANG' },
      });
      expect(prisma.smartMagelangContent.create).toHaveBeenCalledWith({
        data: {
          title: 'Free WiFi',
          description: 'Internet publik',
          categoryId: 'cat-1',
        },
      });
      expect(result).toEqual(mockContent);
    });

    it('should use existing category and create content', async () => {
      const mockCategory = { id: 'cat-2', name: 'Infrastruktur', featureType: 'SMART_MAGELANG' };
      const mockContent = { id: 'content-2', title: 'Free WiFi' };

      prisma.category.findFirst.mockResolvedValue(mockCategory);
      prisma.smartMagelangContent.create.mockResolvedValue(mockContent);

      const result = await smartMagelangService.createContent({
        title: 'Free WiFi',
        description: 'Internet publik',
        categoryName: 'Infrastruktur',
      });

      expect(prisma.category.findFirst).toHaveBeenCalled();
      expect(prisma.category.create).not.toHaveBeenCalled();
      expect(prisma.smartMagelangContent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ categoryId: 'cat-2' }),
      });
      expect(result).toEqual(mockContent);
    });
  });

  describe('deleteContent', () => {
    it('should delete a content', async () => {
      prisma.smartMagelangContent.delete.mockResolvedValue({ id: 'content-1' });

      await smartMagelangService.deleteContent('content-1');

      expect(prisma.smartMagelangContent.delete).toHaveBeenCalledWith({
        where: { id: 'content-1' },
      });
    });
  });
});
