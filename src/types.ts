export interface ReelData {
  href: string;
  viewCount: string;
  likes: string;
  comments: string;
  username?: string;
  reelId?: string;
}

export interface ScrapingConfig {
  username: string;
  password: string;
  targetUrl: string;
  outputFile: string;
  scrollDelay: number;
  maxScrolls: number;
}

export interface ScrapingStats {
  totalReelsFound: number;
  uniqueReels: number;
  duplicatesRemoved: number;
  scrollsPerformed: number;
} 