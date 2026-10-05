import { http as mswHttp, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth';
import { server } from '@/mocks/server';
import { signInAs } from '@/test/utils';
import { ApiError, http } from './apiClient';

describe('apiClient', () => {
  it('serialises params, skipping empty values', async () => {
    let seen = '';
    server.use(
      mswHttp.get('/api/echo', ({ request }) => {
        seen = new URL(request.url).search;
        return HttpResponse.json({ ok: true });
      }),
    );
    await http.get('/echo', { params: { q: 'a b', page: 2, role: '', status: undefined } });
    expect(seen).toBe('?q=a+b&page=2');
  });

  it('attaches the bearer token from the auth store', async () => {
    signInAs('admin');
    let header: string | null = null;
    server.use(
      mswHttp.get('/api/echo', ({ request }) => {
        header = request.headers.get('Authorization');
        return HttpResponse.json({});
      }),
    );
    await http.get('/echo');
    expect(header).toMatch(/^Bearer mock\./);
  });

  it('normalises JSON error bodies into ApiError with field errors', async () => {
    server.use(
      mswHttp.post('/api/echo', () =>
        HttpResponse.json(
          { message: 'Invalid', code: 'VALIDATION', fieldErrors: { email: 'Taken' } },
          { status: 422 },
        ),
      ),
    );
    const error = await http.post('/echo', {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 422,
      code: 'VALIDATION',
      message: 'Invalid',
      fieldErrors: { email: 'Taken' },
    });
  });

  it('falls back to a status-based message for non-JSON errors', async () => {
    server.use(
      mswHttp.get('/api/echo', () => new HttpResponse('<html>oops</html>', { status: 500 })),
    );
    await expect(http.get('/echo')).rejects.toMatchObject({
      status: 500,
      code: 'HTTP_500',
      message: 'The server encountered an error. Please try again.',
    });
  });

  it('maps network failures to a NETWORK_ERROR', async () => {
    server.use(mswHttp.get('/api/echo', () => HttpResponse.error()));
    await expect(http.get('/echo')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });

  it('signs the user out on 401', async () => {
    signInAs('admin');
    server.use(mswHttp.get('/api/echo', () => HttpResponse.json({}, { status: 401 })));
    await expect(http.get('/echo')).rejects.toMatchObject({ status: 401 });
    expect(useAuthStore.getState().token).toBeNull();
  });
});
