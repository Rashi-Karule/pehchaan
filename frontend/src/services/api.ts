import {
  AnalysisResult,
  UploadResponse,
  ReviewRequest,
  ReviewResponse,
  DemoSample,
  LoginRequest,
  LoginResponse,
  OfficerInfo
} from '../types';

const API_BASE = '/api';

let getToken: (() => string | null) | null = null;
let onSessionExpiredCallback: ((msg: string) => void) | null = null;

async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});

  const token = getToken ? getToken() : null;
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(input, {
    ...init,
    headers,
  });

  // Check for 401 Unauthorized (unless this is the login endpoint itself)
  const urlStr = typeof input === 'string' ? input : input.toString();
  if (res.status === 401 && !urlStr.includes('/auth/login')) {
    const errorData = await res.clone().json().catch(() => ({ detail: 'Officer session expired or unauthorized.' }));
    if (onSessionExpiredCallback) {
      onSessionExpiredCallback(errorData.detail || 'Officer session expired. Please log in again.');
    }
  }

  return res;
}

export const api = {
  setTokenGetter(getter: () => string | null) {
    getToken = getter;
  },

  setOnSessionExpired(cb: (msg: string) => void) {
    onSessionExpiredCallback = cb;
  },

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid officer credentials' }));
      throw new Error(err.detail || 'Authentication failed');
    }

    return res.json();
  },

  async getOfficerMe(): Promise<OfficerInfo> {
    const res = await authFetch(`${API_BASE}/auth/me`);
    if (!res.ok) throw new Error('Failed to fetch officer identity');
    return res.json();
  },

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

    const res = await authFetch(`${API_BASE}/documents/upload`, {
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
    const res = await authFetch(`${API_BASE}/documents/analyze`, {
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
    const res = await authFetch(`${API_BASE}/documents/${documentId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Document case not found' }));
      throw new Error(err.detail || 'Failed to fetch document');
    }

    return res.json();
  },

  async saveOfficerReview(caseId: string, req: ReviewRequest): Promise<ReviewResponse> {
    const res = await authFetch(`${API_BASE}/review/${caseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to save review decision' }));
      throw new Error(err.detail || 'Failed to save review');
    }

    return res.json();
  },

  async getDemoSamples(): Promise<DemoSample[]> {
    const res = await authFetch(`${API_BASE}/demo/samples`);
    if (!res.ok) {
      throw new Error('Failed to load demo samples');
    }
    return res.json();
  },

  async loadDemoSample(sampleId: string): Promise<UploadResponse> {
    const res = await authFetch(`${API_BASE}/demo/load/${sampleId}`, {
      method: 'POST',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to load demo sample' }));
      throw new Error(err.detail || 'Failed to load sample');
    }

    return res.json();
  },

  async fetchMediaBlob(url: string): Promise<Blob> {
    const res = await authFetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load authenticated media: ${res.status}`);
    }
    return res.blob();
  }
};
