import handler from '../pages/api/openai-proxy';
import { createMocks } from 'node-mocks-http';

describe('OpenAI Proxy API', () => {
  it('should return 405 for GET', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
  it('should return 500 if no API key', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    process.env.OPENAI_API_KEY = '';
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
  });
}); 