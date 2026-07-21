export class BonusBridgeAIClient {
  constructor({ endpoint = '/api/v1/recommendations', timeoutMs = 8000, enabled = false } = {}) {
    this.endpoint = endpoint;
    this.timeoutMs = timeoutMs;
    this.enabled = enabled;
  }

  async recommend(payload) {
    if (!this.enabled) throw new Error('AI_API_DISABLED');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        signal: controller.signal,
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`AI_API_${response.status}`);
      return response.json();
    } finally { clearTimeout(timer); }
  }
}
