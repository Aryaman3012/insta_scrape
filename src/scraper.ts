import puppeteer, { Browser, Page } from 'puppeteer';
import { ReelData, ScrapingConfig, ScrapingStats } from './types';

export class InstagramReelsScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: ScrapingConfig;

  constructor(config: ScrapingConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing browser...');
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
      defaultViewport: { width: 1366, height: 768 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Block images and videos to improve performance
    await this.page.setRequestInterception(true);
    this.page.on('request', (req) => {
      if (req.resourceType() === 'image' || req.resourceType() === 'media') {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  async login(): Promise<boolean> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('🔐 Logging in to Instagram...');
    
    try {
      await this.page.goto('https://www.instagram.com/accounts/login/', {
        waitUntil: 'networkidle2'
      });

      // Human-like pause to "read" the page
      await this.page.waitForTimeout(this.getRandomDelay(1500, 3000));

      // Wait for login form
      await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
      
      // Random mouse movement before typing
      await this.randomMouseMovement();
      
      // Click on username field first (human behavior)
      await this.page.click('input[name="username"]');
      await this.page.waitForTimeout(this.getRandomDelay(200, 800));
      
      // Type username with human-like delays
      await this.humanizedTyping('input[name="username"]', this.config.username);
      
      // Random pause between fields
      await this.page.waitForTimeout(this.getRandomDelay(500, 1500));
      
      // Click on password field
      await this.page.click('input[name="password"]');
      await this.page.waitForTimeout(this.getRandomDelay(200, 800));
      
      // Type password with human-like delays
      await this.humanizedTyping('input[name="password"]', this.config.password);

      // Pause before clicking login (humans often pause to review)
      await this.page.waitForTimeout(this.getRandomDelay(1000, 2500));

      // Click login button
      await this.page.click('button[type="submit"]');

      // Wait for navigation or error
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

      // Check if login was successful
      const isLoggedIn = await this.page.evaluate(() => {
        return !document.querySelector('div[data-testid="login-error-message"]');
      });

      if (isLoggedIn) {
        console.log('✅ Successfully logged in to Instagram');
        
        // Handle various popups that might appear
        await this.handlePostLoginPopups();

        return true;
      } else {
        console.error('❌ Login failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Error during login:', error);
      return false;
    }
  }

  private async humanizedTyping(selector: string, text: string): Promise<void> {
    if (!this.page) return;

    // Clear field first
    await this.page.evaluate((sel) => {
      const element = document.querySelector(sel) as HTMLInputElement;
      if (element) element.value = '';
    }, selector);

    // Type with variable delays between characters
    for (const char of text) {
      await this.page.type(selector, char, { 
        delay: this.getRandomDelay(80, 200) 
      });
      
      // Occasional longer pauses (human hesitation)
      if (Math.random() < 0.1) {
        await this.page.waitForTimeout(this.getRandomDelay(300, 800));
      }
    }
  }

  private async handlePostLoginPopups(): Promise<void> {
    if (!this.page) return;

    // Handle "Save Login Info" popup
    try {
      await this.page.waitForSelector('button:contains("Not Now")', { timeout: 3000 });
      await this.randomMouseMovement();
      await this.page.waitForTimeout(this.getRandomDelay(500, 1500));
      await this.page.click('button:contains("Not Now")');
      console.log('  📱 Dismissed "Save Login Info" popup');
    } catch (e) {
      // Try alternative selectors
      try {
        const notNowButton = await this.page.$('button[tabindex="0"]:contains("Not Now")');
        if (notNowButton) {
          await this.randomMouseMovement();
          await this.page.waitForTimeout(this.getRandomDelay(500, 1500));
          await notNowButton.click();
          console.log('  📱 Dismissed popup (alternative selector)');
        }
      } catch (e2) {
        // No popup appeared, continue
      }
    }

    // Handle "Turn on Notifications" popup
    try {
      await this.page.waitForSelector('button:contains("Not Now")', { timeout: 2000 });
      await this.randomMouseMovement();
      await this.page.waitForTimeout(this.getRandomDelay(500, 1500));
      await this.page.click('button:contains("Not Now")');
      console.log('  🔔 Dismissed notifications popup');
    } catch (e) {
      // No popup appeared, continue
    }

    // Final pause to let any remaining popups settle
    await this.page.waitForTimeout(this.getRandomDelay(1000, 2000));
  }

  async navigateToTarget(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`🎯 Navigating to target page: ${this.config.targetUrl}`);
    
    // Human-like pause before navigation (like reading/thinking)
    await this.page.waitForTimeout(this.getRandomDelay(1000, 3000));
    
    await this.page.goto(this.config.targetUrl, {
      waitUntil: 'networkidle2'
    });

    // Simulate human behavior - scroll a bit to "look around"
    await this.page.waitForTimeout(this.getRandomDelay(2000, 4000));
    await this.randomMouseMovement();
    
    // Small scroll to simulate checking the page
    await this.page.evaluate(() => {
      window.scrollTo({
        top: window.innerHeight * 0.2,
        behavior: 'smooth'
      });
    });
    
    await this.page.waitForTimeout(this.getRandomDelay(1000, 2000));
    
    // Scroll back to top
    await this.page.evaluate(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Wait for reels to load
    await this.page.waitForSelector('a[href*="/reel/"]', { timeout: 15000 });
    console.log('✅ Target page loaded successfully');
    
    // Final pause before starting the scraping process
    await this.page.waitForTimeout(this.getRandomDelay(2000, 4000));
  }

  async scrollAndLoadReels(): Promise<ReelData[]> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('📜 Starting dynamic scroll and extraction...');
    
    const allReelsMap = new Map<string, ReelData>(); // Use Map to avoid duplicates by href
    let scrollCount = 0;
    
    console.log(`🎯 Target: ${this.config.maxScrolls} scrolls`);

    while (scrollCount < this.config.maxScrolls) {
      scrollCount++;
      console.log(`\n🔄 Scroll ${scrollCount}/${this.config.maxScrolls}`);

      // Perform humanized scroll
      await this.humanizedScroll();
      
      // Wait for content to load and stabilize
      const stabilizeDelay = this.getRandomDelay(2000, 4000);
      console.log(`  ⏳ Waiting ${Math.round(stabilizeDelay/1000)}s for content to stabilize...`);
      await this.page.waitForTimeout(stabilizeDelay);

      // Extract current page data
      console.log('  🔍 Extracting visible reels...');
      const currentReels = await this.extractReelsData();
      
      // Add new reels to our collection (using href as unique key)
      let newReelsInThisBatch = 0;
      currentReels.forEach(reel => {
        if (!allReelsMap.has(reel.href)) {
          allReelsMap.set(reel.href, reel);
          newReelsInThisBatch++;
        }
      });

      const currentTotal = allReelsMap.size;
      console.log(`  📈 Found ${newReelsInThisBatch} new reels this scroll (Total: ${currentTotal})`);

      // Check if we've reached the end of the profile
      const hasReachedEnd = await this.page.evaluate(() => {
        const currentScroll = window.pageYOffset;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        return Math.abs(currentScroll - maxScroll) < 100; // Within 100px of bottom
      });

      if (hasReachedEnd) {
        console.log('  🏁 Reached end of profile');
        break;
      }

      // Human-like pause between scrolls
      if (scrollCount < this.config.maxScrolls) {
        const pauseTime = this.getRandomDelay(1500, 3500);
        console.log(`  😴 Human-like pause (${Math.round(pauseTime/1000)}s)...`);
        await this.page.waitForTimeout(pauseTime);
      }
    }

    // Final extraction to ensure we didn't miss anything
    console.log('\n🔍 Final extraction sweep...');
    const finalReels = await this.extractReelsData();
    finalReels.forEach(reel => {
      if (!allReelsMap.has(reel.href)) {
        allReelsMap.set(reel.href, reel);
      }
    });

    const allReelsArray = Array.from(allReelsMap.values());
    
    // Calculate completion stats
    const reelsWithCompleteData = allReelsArray.filter(r => 
      r.viewCount !== '0' && r.likes !== '0' && r.comments !== '0'
    ).length;

    console.log(`\n✅ Dynamic extraction completed!`);
    console.log(`   📊 Total scrolls performed: ${scrollCount}`);
    console.log(`   🎬 Total unique reels found: ${allReelsArray.length}`);
    console.log(`   📈 Reels with complete data: ${reelsWithCompleteData}`);
    console.log(`   📉 Reels with missing data: ${allReelsArray.length - reelsWithCompleteData}`);

    return allReelsArray;
  }

  private async humanizedScroll(): Promise<void> {
    if (!this.page) return;

    // Random mouse movement before scrolling
    await this.randomMouseMovement();

    // Variable scroll behavior - sometimes scroll to bottom, sometimes partial
    const scrollType = Math.random();
    
    if (scrollType < 0.7) {
      // 70% - Scroll to bottom (normal behavior)
      await this.page.evaluate(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      });
    } else if (scrollType < 0.9) {
      // 20% - Scroll partial amount (human-like hesitation)
      await this.page.evaluate(() => {
        const currentScroll = window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const scrollAmount = viewportHeight * (0.3 + Math.random() * 0.7); // 30-100% of viewport
        window.scrollTo({
          top: currentScroll + scrollAmount,
          behavior: 'smooth'
        });
      });
    } else {
      // 10% - Scroll up slightly then down (human correction behavior)
      await this.page.evaluate(() => {
        const currentScroll = window.pageYOffset;
        const viewportHeight = window.innerHeight;
        // Scroll up a bit first
        window.scrollTo({
          top: Math.max(0, currentScroll - viewportHeight * 0.1),
          behavior: 'smooth'
        });
      });
      
      await this.page.waitForTimeout(this.getRandomDelay(500, 1500));
      
      // Then scroll down more than intended
      await this.page.evaluate(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }

  private async randomMouseMovement(): Promise<void> {
    if (!this.page) return;

    // 30% chance to move mouse randomly
    if (Math.random() < 0.3) {
      const viewport = this.page.viewport();
      if (viewport) {
        const x = Math.random() * viewport.width;
        const y = Math.random() * viewport.height;
        await this.page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
      }
    }
  }

  private getRandomDelay(min: number = this.config.scrollDelay * 0.7, max: number = this.config.scrollDelay * 1.3): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async extractReelsData(): Promise<ReelData[]> {
    if (!this.page) throw new Error('Page not initialized');

    return await this.page.evaluate(() => {
      const reels: ReelData[] = [];
      
      // Find all reel links
      const reelLinks = document.querySelectorAll('a[href*="/reel/"]');
      
      reelLinks.forEach((link) => {
        const href = (link as HTMLAnchorElement).href || (link as HTMLAnchorElement).getAttribute('href') || '';
        
        // Extract engagement data from the reel container using the same logic as HTML parser
        const engagementData = extractEngagementData(link as HTMLElement);
        
        // Extract username and reel ID from href
        const urlParts = href.split('/');
        const reelIndex = urlParts.indexOf('reel');
        const username = reelIndex > 0 ? urlParts[reelIndex - 1] : '';
        const reelId = reelIndex >= 0 && reelIndex < urlParts.length - 1 ? urlParts[reelIndex + 1] : '';
        
        reels.push({
          href,
          viewCount: engagementData.viewCount || '0',
          likes: engagementData.likes || '0',
          comments: engagementData.comments || '0',
          username,
          reelId
        });
      });
      
      // Helper function to extract engagement data (same logic as HTML parser)
      function extractEngagementData(reelLink: HTMLElement): { viewCount?: string; likes?: string; comments?: string } {
        const result: { viewCount?: string; likes?: string; comments?: string } = {};

        // Find the container div that holds all the engagement data
        let container: Element | null = reelLink.closest('div');
        let attempts = 0;
        
        while (container && attempts < 6) {
          // Look for the engagement stats container
          const engagementContainer = container.querySelector('div._aajz') || 
                                     container.querySelector('ul.x6s0dn4.x972fbf');

          if (engagementContainer) {
            // Extract likes and comments from the list items
            const listItems = engagementContainer.querySelectorAll('li');
            
            listItems.forEach((li, index) => {
              const span = li.querySelector('span.html-span.xdj266r');
              if (span?.textContent?.trim()) {
                const value = span.textContent.trim();
                
                // Based on Instagram structure:
                // First li typically contains likes
                // Second li typically contains comments
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
            extractWithBroaderSearch(container, result);
          }

          container = container.parentElement;
          attempts++;
        }

        return result;
      }

      function extractWithBroaderSearch(container: Element, result: { viewCount?: string; likes?: string; comments?: string }): void {
        // Find all spans with the specific class pattern
        const allEngagementSpans = container.querySelectorAll('span.html-span.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1hl2dhg.x16tdsg8.x1vvkbs');
        
        const values: string[] = [];
        allEngagementSpans.forEach(span => {
          const text = span.textContent?.trim();
          if (text && /^[\d,]+[KkMm]?$/.test(text)) {
            values.push(text);
          }
        });

        // Helper function to parse view count to number for sorting
        function parseViewCount(viewCount: string): number {
          if (!viewCount || viewCount === '0') return 0;
          
          const cleanCount = viewCount.toLowerCase().replace(/,/g, '');
          
          if (cleanCount.includes('k')) {
            return parseFloat(cleanCount.replace('k', '')) * 1000;
          }
          
          if (cleanCount.includes('m')) {
            return parseFloat(cleanCount.replace('m', '')) * 1000000;
          }
          
          return parseInt(cleanCount) || 0;
        }

        // Sort values to identify likely likes, comments, and views
        // Generally: views > likes > comments
        if (values.length >= 3) {
          const sortedValues = values.map(v => ({
            text: v,
            numeric: parseViewCount(v)
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
      
      return reels;
    });
  }

  async getScrapingStats(reelsData: ReelData[]): Promise<ScrapingStats> {
    const uniqueHrefs = new Set(reelsData.map(reel => reel.href));
    
    return {
      totalReelsFound: reelsData.length,
      uniqueReels: uniqueHrefs.size,
      duplicatesRemoved: reelsData.length - uniqueHrefs.size,
      scrollsPerformed: Math.min(this.config.maxScrolls, reelsData.length)
    };
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
} 