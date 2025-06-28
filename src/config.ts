import * as dotenv from 'dotenv';
import { ScrapingConfig } from './types';

// Load environment variables
dotenv.config();

export function loadConfig(): ScrapingConfig {
  const requiredEnvVars = ['INSTAGRAM_USERNAME', 'INSTAGRAM_PASSWORD'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    username: process.env.INSTAGRAM_USERNAME!,
    password: process.env.INSTAGRAM_PASSWORD!,
    targetUrl: process.env.TARGET_URL || 'https://www.instagram.com/explore/reels/',
    outputFile: process.env.OUTPUT_FILE || 'scraped_reels.csv',
    scrollDelay: parseInt(process.env.SCROLL_DELAY || '2000'),
    maxScrolls: parseInt(process.env.MAX_SCROLLS || '50')
  };
}

export function validateConfig(config: ScrapingConfig): void {
  if (!config.username || !config.password) {
    throw new Error('Instagram username and password are required');
  }

  if (!config.targetUrl.includes('instagram.com')) {
    throw new Error('Target URL must be an Instagram URL');
  }

  if (config.scrollDelay < 1000) {
    console.warn('⚠️ Warning: Scroll delay less than 1000ms may cause issues');
  }

  if (config.maxScrolls > 100) {
    console.warn('⚠️ Warning: High number of scrolls may take a very long time');
  }
} 