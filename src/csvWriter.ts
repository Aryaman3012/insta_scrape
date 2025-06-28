import * as createCsvWriter from 'csv-writer';
import { ReelData } from './types';
import path from 'path';

export class CSVWriter {
  private csvWriter: any;
  private outputPath: string;

  constructor(outputFileName: string) {
    this.outputPath = path.resolve(outputFileName);
    
    this.csvWriter = createCsvWriter.createObjectCsvWriter({
      path: this.outputPath,
      header: [
        { id: 'href', title: 'Reel URL' },
        { id: 'viewCount', title: 'View Count' },
        { id: 'likes', title: 'Likes' },
        { id: 'comments', title: 'Comments' },
        { id: 'username', title: 'Username' },
        { id: 'reelId', title: 'Reel ID' },
        { id: 'fullUrl', title: 'Full Instagram URL' }
      ]
    });
  }

  async writeReelsData(reelsData: ReelData[]): Promise<void> {
    console.log(`📝 Writing ${reelsData.length} reels to CSV file: ${this.outputPath}`);

    // Process the data to include full URLs and convert view counts
    const processedData = reelsData.map(reel => ({
      ...reel,
      viewCount: this.convertViewCount(reel.viewCount),
      likes: this.convertViewCount(reel.likes),
      comments: this.convertViewCount(reel.comments),
      fullUrl: reel.href.startsWith('http') 
        ? reel.href 
        : `https://www.instagram.com${reel.href}`
    }));

    try {
      await this.csvWriter.writeRecords(processedData);
      console.log(`✅ Successfully saved ${processedData.length} reels to ${this.outputPath}`);
    } catch (error) {
      console.error('❌ Error writing CSV file:', error);
      throw error;
    }
  }

  private convertViewCount(viewCount: string): string {
    // Handle view counts with 'K' (thousands)
    if (viewCount.toLowerCase().includes('k')) {
      // Remove 'K' and any whitespace, then convert to number
      const numericPart = viewCount.toLowerCase().replace('k', '').replace(/,/g, '').trim();
      const number = parseFloat(numericPart);
      
      if (!isNaN(number)) {
        // Multiply by 1000 and return as string
        return Math.round(number * 1000).toString();
      }
    }
    
    // Handle view counts with 'M' (millions) - just in case
    if (viewCount.toLowerCase().includes('m')) {
      const numericPart = viewCount.toLowerCase().replace('m', '').replace(/,/g, '').trim();
      const number = parseFloat(numericPart);
      
      if (!isNaN(number)) {
        // Multiply by 1,000,000 and return as string
        return Math.round(number * 1000000).toString();
      }
    }
    
    // Remove commas from regular numbers (e.g., "1,234" becomes "1234")
    const cleanedCount = viewCount.replace(/,/g, '').trim();
    
    // If it's already a plain number, return as is
    return cleanedCount;
  }

  getOutputPath(): string {
    return this.outputPath;
  }
} 