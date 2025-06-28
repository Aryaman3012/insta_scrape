import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import { CSVWriter } from './csvWriter';
import { ReelData } from './types';

export class HTMLReelsParser {
  private htmlContent: string = '';

  constructor(htmlContent?: string) {
    if (htmlContent) {
      this.htmlContent = htmlContent;
    }
  }

  // Load HTML from file
  loadFromFile(filePath: string): void {
    try {
      this.htmlContent = fs.readFileSync(filePath, 'utf-8');
      console.log(`📄 Loaded HTML file: ${filePath}`);
      console.log(`📏 File size: ${Math.round(this.htmlContent.length / 1024)} KB`);
    } catch (error) {
      throw new Error(`Failed to read HTML file: ${error}`);
    }
  }

  // Set HTML content directly
  setHTMLContent(html: string): void {
    this.htmlContent = html;
    console.log(`📄 HTML content loaded (${Math.round(html.length / 1024)} KB)`);
  }

  // Extract all reels from the HTML
  extractReels(): ReelData[] {
    if (!this.htmlContent) {
      throw new Error('No HTML content loaded. Use loadFromFile() or setHTMLContent() first.');
    }

    console.log('🔍 Parsing HTML and extracting reels...');

    const dom = new JSDOM(this.htmlContent);
    const document = dom.window.document;

    const reelsMap = new Map<string, ReelData>();
    let totalReelLinks = 0;
    let reelsWithCompleteData = 0;

    // Find all reel links
    const reelLinks = document.querySelectorAll('a[href*="/reel/"]');
    totalReelLinks = reelLinks.length;
    console.log(`📊 Found ${totalReelLinks} reel links`);

    reelLinks.forEach((link, index) => {
      const href = (link as HTMLAnchorElement).href || link.getAttribute('href') || '';
      
      // Extract username and reel ID from href
      const urlParts = href.split('/');
      const reelIndex = urlParts.indexOf('reel');
      const username = reelIndex > 0 ? urlParts[reelIndex - 1] : '';
      const reelId = reelIndex >= 0 && reelIndex < urlParts.length - 1 ? urlParts[reelIndex + 1] : '';

      // Extract engagement data from the reel container
      const engagementData = this.extractEngagementData(link as HTMLElement);

      // Create reel data
      const reelData: ReelData = {
        href: href,
        viewCount: engagementData.viewCount || '0',
        likes: engagementData.likes || '0',
        comments: engagementData.comments || '0',
        username: username,
        reelId: reelId
      };

      // Check if we got complete data
      if (engagementData.viewCount && engagementData.likes && engagementData.comments) {
        reelsWithCompleteData++;
      }

      // Use href as unique key (remove duplicates)
      reelsMap.set(href, reelData);
    });

    const reelsArray = Array.from(reelsMap.values());
    
    console.log(`✅ Extraction complete:`);
    console.log(`   - Total reel links found: ${totalReelLinks}`);
    console.log(`   - Unique reels: ${reelsArray.length}`);
    console.log(`   - Reels with complete data: ${reelsWithCompleteData}`);
    console.log(`   - Reels with missing data: ${reelsArray.length - reelsWithCompleteData}`);

    return reelsArray;
  }

  private extractEngagementData(reelLink: HTMLElement): { viewCount?: string; likes?: string; comments?: string } {
    const result: { viewCount?: string; likes?: string; comments?: string } = {};

    // Find the container div that holds all the engagement data
    let container: Element | null = reelLink.closest('div');
    let attempts = 0;
    
    while (container && attempts < 6) {
      // Look for the engagement stats container
      // This targets the div structure from your HTML sample
      const engagementContainer = container.querySelector('div._aajz') || 
                                 container.querySelector('ul.x6s0dn4.x972fbf');

      if (engagementContainer) {
        // Extract likes and comments from the list items
        const listItems = engagementContainer.querySelectorAll('li');
        
        listItems.forEach((li, index) => {
          const span = li.querySelector('span.html-span.xdj266r');
          if (span?.textContent?.trim()) {
            const value = span.textContent.trim();
            
            // Based on your HTML structure:
            // First li typically contains likes (454 in your example)
            // Second li typically contains comments (6 in your example)
            if (index === 0) {
              result.likes = value;
            } else if (index === 1) {
              result.comments = value;
            }
          }
        });

        // Look for view count - it's usually in a separate section
        const viewCountSpan = container.querySelector('span.html-span.xdj266r:not(li span)') ||
                             container.querySelector('div._aajy span.html-span.xdj266r');
        
        if (viewCountSpan?.textContent?.trim()) {
          const viewText = viewCountSpan.textContent.trim();
          // Validate it looks like a view count (contains K, M, or larger numbers)
          if (/[\d,]+[KkMm]/.test(viewText) || parseInt(viewText.replace(/,/g, '')) > 1000) {
            result.viewCount = viewText;
          }
        }

        // If we found some data, break out of the loop
        if (result.likes || result.comments || result.viewCount) {
          break;
        }
      }

      // Try broader search patterns if specific structure not found
      if (!result.viewCount || !result.likes || !result.comments) {
        this.extractWithBroaderSearch(container, result);
      }

      container = container.parentElement;
      attempts++;
    }

    return result;
  }

  private extractWithBroaderSearch(container: Element, result: { viewCount?: string; likes?: string; comments?: string }): void {
    // Find all spans with the specific class pattern from your HTML
    const allEngagementSpans = container.querySelectorAll('span.html-span.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1hl2dhg.x16tdsg8.x1vvkbs');
    
    const values: string[] = [];
    allEngagementSpans.forEach(span => {
      const text = span.textContent?.trim();
      if (text && /^[\d,]+[KkMm]?$/.test(text)) {
        values.push(text);
      }
    });

    // Sort values to identify likely likes, comments, and views
    // Generally: likes > comments, views > likes
    if (values.length >= 3) {
      const sortedValues = values.map(v => ({
        text: v,
        numeric: this.parseViewCount(v)
      })).sort((a, b) => b.numeric - a.numeric);

      // Assign based on typical Instagram engagement patterns
      if (!result.viewCount) result.viewCount = sortedValues[0].text; // Highest number is usually views
      if (!result.likes) result.likes = sortedValues[1].text;         // Second highest is usually likes  
      if (!result.comments) result.comments = sortedValues[2].text;   // Lowest is usually comments
    } else if (values.length === 2) {
      if (!result.likes) result.likes = values[0];
      if (!result.comments) result.comments = values[1];
    } else if (values.length === 1) {
      // If only one value, it's likely views (most prominent display)
      if (!result.viewCount) result.viewCount = values[0];
    }
  }

  // Save extracted reels to CSV
  async saveToCSV(reels: ReelData[], outputFile: string = 'parsed_reels.csv'): Promise<void> {
    const csvWriter = new CSVWriter(outputFile);
    await csvWriter.writeReelsData(reels);
  }

  // Get statistics about the parsed content
  getParsingStats(reels: ReelData[]): any {
    const withViewCounts = reels.filter(r => r.viewCount !== '0').length;
    const uniqueUsers = new Set(reels.map(r => r.username)).size;
    
    return {
      totalReels: reels.length,
      reelsWithViewCounts: withViewCounts,
      reelsWithoutViewCounts: reels.length - withViewCounts,
      uniqueUsers: uniqueUsers,
      avgViewCount: this.calculateAverageViews(reels)
    };
  }

  private calculateAverageViews(reels: ReelData[]): string {
    const validCounts = reels
      .map(r => this.parseViewCount(r.viewCount))
      .filter(count => count > 0);
    
    if (validCounts.length === 0) return '0';
    
    const average = validCounts.reduce((sum, count) => sum + count, 0) / validCounts.length;
    return this.formatNumber(average);
  }

  private parseViewCount(viewCount: string): number {
    const cleaned = viewCount.toLowerCase().replace(/,/g, '');
    
    if (cleaned.includes('k')) {
      return parseFloat(cleaned.replace('k', '')) * 1000;
    }
    if (cleaned.includes('m')) {
      return parseFloat(cleaned.replace('m', '')) * 1000000;
    }
    
    return parseInt(cleaned) || 0;
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.round(num).toString();
  }
} 