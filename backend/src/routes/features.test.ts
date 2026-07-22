import request from 'supertest';
import express from 'express';
import { featureToggleService } from '../services/featureToggleService';

// Create a mock router to test
const app = express();
app.use(express.json());

// Mocking the feature routes
app.get('/api/features', async (req, res) => {
  try {
    const features = await featureToggleService.getAllFeatures();
    res.json(features);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

app.patch('/api/features/:name', async (req, res) => {
  try {
    const { isActive } = req.body;
    const feature = await featureToggleService.toggleFeature(req.params.name, isActive);
    res.json(feature);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle feature' });
  }
});

// Mock the service
jest.mock('../services/featureToggleService');

describe('Feature Toggle API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/features', () => {
    it('should return 200 and a list of features', async () => {
      const mockFeatures = [{ id: '1', name: 'Event', isActive: true }];
      (featureToggleService.getAllFeatures as jest.Mock).mockResolvedValue(mockFeatures);

      const response = await request(app).get('/api/features');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFeatures);
      expect(featureToggleService.getAllFeatures).toHaveBeenCalled();
    });

    it('should return 500 if service fails', async () => {
      (featureToggleService.getAllFeatures as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await request(app).get('/api/features');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch features' });
    });
  });

  describe('PATCH /api/features/:name', () => {
    it('should return 200 and the updated feature', async () => {
      const mockFeature = { id: '1', name: 'Event', isActive: false };
      (featureToggleService.toggleFeature as jest.Mock).mockResolvedValue(mockFeature);

      const response = await request(app).patch('/api/features/Event').send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFeature);
      expect(featureToggleService.toggleFeature).toHaveBeenCalledWith('Event', false);
    });
  });
});
