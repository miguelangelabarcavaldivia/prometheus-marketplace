import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export interface Config {
  provider: 'openai' | 'anthropic' | 'gemini';
  model: string;
  apiKey: string;
  maxTokens: number;
  conventionalCommits: boolean;
  emoji: boolean;
  language: string;
  maxDiffLength: number;
}

const DEFAULTS: Config = {
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: '',
  maxTokens: 1000,
  conventionalCommits: true,
  emoji: false,
  language: 'en',
  maxDiffLength: 15000,
};

const PROVIDER_ENV_KEYS: Record<string, string> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY',
};

export function loadConfig(): Config {
  const configPaths = [
    join(process.cwd(), '.aicommitrc'),
    join(homedir(), '.aicommitrc'),
  ];

  let fileConfig: Partial<Config> = {};

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8');
        fileConfig = { ...fileConfig, ...JSON.parse(content) };
        break;
      } catch {
        console.error(`Warning: Could not parse config at ${configPath}`);
      }
    }
  }

  const config: Config = { ...DEFAULTS, ...fileConfig };

  if (!config.apiKey) {
    const envKey = PROVIDER_ENV_KEYS[config.provider];
    if (envKey && process.env[envKey]) {
      config.apiKey = process.env[envKey]!;
    }
  }

  if (process.env.AICOMMIT_PROVIDER) {
    config.provider = process.env.AICOMMIT_PROVIDER as Config['provider'];
  }
  if (process.env.AICOMMIT_MODEL) {
    config.model = process.env.AICOMMIT_MODEL;
  }
  if (process.env.AICOMMIT_API_KEY) {
    config.apiKey = process.env.AICOMMIT_API_KEY;
  }

  return config;
}

export function saveConfig(config: Partial<Config>): void {
  const configPath = join(process.cwd(), '.aicommitrc');
  const fullConfig = { ...DEFAULTS, ...config };
  writeFileSync(configPath, JSON.stringify(fullConfig, null, 2));
}

export function getDefaultConfig(): Config {
  return { ...DEFAULTS };
}
