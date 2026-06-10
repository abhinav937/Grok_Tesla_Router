import OpenAI from 'openai'

let _client: OpenAI | null = null

export function getGrokClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.XAI_API_KEY ?? 'placeholder',
      baseURL: 'https://api.x.ai/v1',
    })
  }
  return _client
}
