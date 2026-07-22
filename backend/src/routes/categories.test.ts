import request from 'supertest';
import express from 'express';
import { categoryService } from '../services/categoryService';

const app = express();
app.use(express.json());

// Mock Category Routes
app.get('/api/categories', async (req, res) => {
  try {
    const { featureType } = req.query;
    const categories = await categoryService.getCategories(featureType as string);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, featureType } = req.body;
    const category = await categoryService.createCategory(name, featureType);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const category = await categoryService.updateCategory(req.params.id, name);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

jest.mock('../services/categoryService');

describe('Category API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    it('should return a list of categories', async () => {
      const mockCategories = [{ id: '1', name: 'Alam', featureType: 'WISATA' }];
      (categoryService.getCategories as jest.Mock).mockResolvedValue(mockCategories);

      const response = await request(app).get('/api/categories?featureType=WISATA');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategories);
      expect(categoryService.getCategories).toHaveBeenCalledWith('WISATA');
    });
  });

  describe('POST /api/categories', () => {
    it('should create a category and return 201', async () => {
      const mockCategory = { id: '1', name: 'Alam', featureType: 'WISATA' };
      (categoryService.createCategory as jest.Mock).mockResolvedValue(mockCategory);

      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'Alam', featureType: 'WISATA' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockCategory);
      expect(categoryService.createCategory).toHaveBeenCalledWith('Alam', 'WISATA');
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update category name and return 200', async () => {
      const mockCategory = { id: '1', name: 'Wisata Alam', featureType: 'WISATA' };
      (categoryService.updateCategory as jest.Mock).mockResolvedValue(mockCategory);

      const response = await request(app).put('/api/categories/1').send({ name: 'Wisata Alam' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCategory);
      expect(categoryService.updateCategory).toHaveBeenCalledWith('1', 'Wisata Alam');
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete category and return 204', async () => {
      (categoryService.deleteCategory as jest.Mock).mockResolvedValue({ id: '1' });

      const response = await request(app).delete('/api/categories/1');

      expect(response.status).toBe(204);
      expect(categoryService.deleteCategory).toHaveBeenCalledWith('1');
    });
  });
});
