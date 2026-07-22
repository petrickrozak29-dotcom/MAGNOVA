import { PrismaClient } from '@prisma/client';
import { featureToggleService } from './featureToggleService';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    featureToggle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Feature Toggle Service', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('getAllFeatures', () => {
    it('should return a list of all feature toggles', async () => {
      const mockFeatures = [
        { id: '1', name: 'Event', isActive: true },
        { id: '2', name: 'Wisata', isActive: false },
      ];
      prisma.featureToggle.findMany.mockResolvedValue(mockFeatures);

      const result = await featureToggleService.getAllFeatures();

      expect(prisma.featureToggle.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockFeatures);
    });
  });

  describe('getFeatureByName', () => {
    it('should return a feature toggle by name', async () => {
      const mockFeature = { id: '1', name: 'Event', isActive: true };
      prisma.featureToggle.findUnique.mockResolvedValue(mockFeature);

      const result = await featureToggleService.getFeatureByName('Event');

      expect(prisma.featureToggle.findUnique).toHaveBeenCalledWith({
        where: { name: 'Event' },
      });
      expect(result).toEqual(mockFeature);
    });

    it('should return null if feature toggle does not exist', async () => {
      prisma.featureToggle.findUnique.mockResolvedValue(null);

      const result = await featureToggleService.getFeatureByName('NonExistent');

      expect(result).toBeNull();
    });
  });

  describe('toggleFeature', () => {
    it('should update or create the feature toggle status', async () => {
      const mockFeature = { id: '1', name: 'Event', isActive: false };
      prisma.featureToggle.upsert.mockResolvedValue(mockFeature);

      const result = await featureToggleService.toggleFeature('Event', false);

      expect(prisma.featureToggle.upsert).toHaveBeenCalledWith({
        where: { name: 'Event' },
        update: { isActive: false },
        create: { name: 'Event', isActive: false, description: 'Feature Event' },
      });
      expect(result).toEqual(mockFeature);
    });
  });

  describe('isFeatureActive', () => {
    it('should return the active status if feature exists', async () => {
      const mockFeature = { id: '1', name: 'Event', isActive: false };
      prisma.featureToggle.findUnique.mockResolvedValue(mockFeature);

      const result = await featureToggleService.isFeatureActive('Event');

      expect(result).toBe(false);
    });

    it('should return true as default if feature does not exist', async () => {
      prisma.featureToggle.findUnique.mockResolvedValue(null);

      const result = await featureToggleService.isFeatureActive('NonExistent');

      expect(result).toBe(true);
    });
  });
});
