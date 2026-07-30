import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Config } from './config.js';

export async function generateWithAI(config: Config, prompt: string, systemPrompt?: string): Promise<string> {
  if (!config.apiKey) {
    throw new Error(
      `No API key configured for ${config.provider}. ` +
      `Set it in .aicommitrc, or use the ${config.provider.toUpperCase()}_API_KEY environment variable.`
    );
  }

  switch (config.provider) {
    case 'openai':
      return generateOpenAI(config, prompt, systemPrompt);
    case 'anthropic':
      return generateAnthropic(config, prompt, systemPrompt);
    case 'gemini':
      return generateGemini(config, prompt, systemPrompt);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

async function generateOpenAI(config: Config, prompt: string, systemPrompt?: string): Promise<string> {
  const client = new OpenAI({ apiKey: config.apiKey });

  const messages: { role: 'system' | 'user'; content: string }[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await client.chat.completions.create({
    model: config.model,
    messages,
    max_tokens: config.maxTokens,
  });

  return response.choices[0]?.message?.content?.trim() || '';
}

async function generateAnthropic(config: Config, prompt: string, systemPrompt?: string): Promise<string> {
  const client = new Anthropic({ apiKey: config.apiKey });

  const response = await client.messages.create({
    model: config.model,
    max_tokens: config.maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content && 'text' in content) {
    return content.text.trim();
  }
  return '';
}

async function generateGemini(config: Config, prompt: string, systemPrompt?: string): Promise<string> {
  const client = new GoogleGenerativeAI(config.apiKey);
  const model = client.getGenerativeModel({
    model: config.model,
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
