import request from 'supertest';
import express from 'express';
import { submissionService } from '../services/submissionService';

const app = express();
app.use(express.json());

// Mock Submission Routes
app.get('/api/submissions', async (req, res) => {
  try {
    const { featureType, status, submittedById } = req.query;
    const submissions = await submissionService.getSubmissions({
      featureType: featureType as string,
      status: status as string,
      submittedById: submittedById as string,
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.post('/api/submissions', async (req, res) => {
  try {
    const submission = await submissionService.createSubmission(req.body);
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

app.patch('/api/submissions/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const submission = await submissionService.updateStatus(req.params.id, status);
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update submission status' });
  }
});

app.delete('/api/submissions/:id', async (req, res) => {
  try {
    await submissionService.deleteSubmission(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

jest.mock('../services/submissionService');

describe('Submission API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/submissions', () => {
    it('should return a list of submissions', async () => {
      const mockSubmissions = [{ id: '1', title: 'Test Event' }];
      (submissionService.getSubmissions as jest.Mock).mockResolvedValue(mockSubmissions);

      const response = await request(app).get('/api/submissions?featureType=EVENT');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubmissions);
      expect(submissionService.getSubmissions).toHaveBeenCalledWith({
        featureType: 'EVENT',
        status: undefined,
        submittedById: undefined,
      });
    });
  });

  describe('POST /api/submissions', () => {
    it('should create a new submission and return 201', async () => {
      const mockSubmission = { id: '1', title: 'New Wisata', status: 'PENDING' };
      const input = { title: 'New Wisata', featureType: 'WISATA', categoryName: 'Alam' };

      (submissionService.createSubmission as jest.Mock).mockResolvedValue(mockSubmission);

      const response = await request(app).post('/api/submissions').send(input);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockSubmission);
      expect(submissionService.createSubmission).toHaveBeenCalledWith(input);
    });
  });

  describe('PATCH /api/submissions/:id/status', () => {
    it('should update the status of a submission', async () => {
      const mockSubmission = { id: '1', status: 'APPROVED' };
      (submissionService.updateStatus as jest.Mock).mockResolvedValue(mockSubmission);

      const response = await request(app)
        .patch('/api/submissions/1/status')
        .send({ status: 'APPROVED' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubmission);
      expect(submissionService.updateStatus).toHaveBeenCalledWith('1', 'APPROVED');
    });
  });

  describe('DELETE /api/submissions/:id', () => {
    it('should delete a submission and return 204', async () => {
      (submissionService.deleteSubmission as jest.Mock).mockResolvedValue({ id: '1' });

      const response = await request(app).delete('/api/submissions/1');

      expect(response.status).toBe(204);
      expect(submissionService.deleteSubmission).toHaveBeenCalledWith('1');
    });
  });
});
