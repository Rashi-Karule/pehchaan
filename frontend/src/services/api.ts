import {
  AnalysisResult,
  UploadResponse,
  ReviewRequest,
  ReviewResponse,
  DemoSample
} from '../types';

const API_BASE = '/api';

export const api = {
  async healthCheck(): Promise<{ status: string; system: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async uploadDocument(documentFile: File, selfieFile?: File | null): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('document', documentFile);
    if (selfieFile) {
      formData.append('selfie', selfieFile);
    }

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to upload document' }));
      throw new Error(err.detail || 'Upload failed');
    }

    return res.json();
  },

  async analyzeDocument(documentId: string): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE}/documents/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to analyze document' }));
      throw new Error(err.detail || 'Analysis failed');
    }

    return res.json();
  },

  async getDocument(documentId: string): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE}/documents/${documentId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Document case not found' }));
      throw new Error(err.detail || 'Failed to fetch document');
    }
    return res.json();
  },

  async submitReview(caseId: string, request: ReviewRequest): Promise<ReviewResponse> {
    const res = await fetch(`${API_BASE}/review/${caseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit review' }));
      throw new Error(err.detail || 'Review submission failed');
    }

    return res.json();
  },

  async getDemoSamples(): Promise<DemoSample[]> {
    const res = await fetch(`${API_BASE}/demo/samples`);
    if (!res.ok) throw new Error('Failed to fetch demo samples');
    return res.json();
  },

  async loadDemoSample(sampleId: string): Promise<UploadResponse> {
    const res = await fetch(`${API_BASE}/demo/load/${sampleId}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to load demo sample' }));
      throw new Error(err.detail || 'Demo sample load failed');
    }
    return res.json();
  },
};
