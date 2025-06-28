import { InstagramReelsScraper } from './scraper';
import { CSVWriter } from './csvWriter';
import { loadConfig, validateConfig } from './config';
import { ScrapingStats } from './types';

async function main(): Promise<void> {
  console.log('🎬 Instagram Reels Scraper Starting...\n');

  let scraper: InstagramReelsScraper | null = null;

  try {
    // Load and validate configuration
    console.log('⚙️ Loading configuration...');
    const config = loadConfig();
    validateConfig(config);
    
    console.log(`📋 Configuration:
    - Target URL: ${config.targetUrl}
    - Output File: ${config.outputFile}
    - Max Scrolls: ${config.maxScrolls}
    - Scroll Delay: ${config.scrollDelay}ms\n`);

    // Initialize scraper
    scraper = new InstagramReelsScraper(config);
    await scraper.initialize();

    // Login to Instagram
    const loginSuccess = await scraper.login();
    if (!loginSuccess) {
      throw new Error('Failed to login to Instagram');
    }

    // Navigate to target page
    await scraper.navigateToTarget();

    // Wait a bit for the page to fully load
    console.log('⏳ Waiting for page to stabilize...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start scraping process
    console.log('\n🔍 Starting data extraction process...\n');
    const reelsData = await scraper.scrollAndLoadReels();

    if (reelsData.length === 0) {
      console.log('⚠️ No reels found. This might be due to:');
      console.log('   - Private account or restricted content');
      console.log('   - Changed Instagram layout/selectors');
      console.log('   - Network issues');
      return;
    }

    // Get scraping statistics
    const stats: ScrapingStats = await scraper.getScrapingStats(reelsData);
    
    console.log('\n📊 Scraping Statistics:');
    console.log(`   - Total Reels Found: ${stats.totalReelsFound}`);
    console.log(`   - Unique Reels: ${stats.uniqueReels}`);
    console.log(`   - Duplicates Removed: ${stats.duplicatesRemoved}`);
    console.log(`   - Scrolls Performed: ${stats.scrollsPerformed}\n`);

    // Write data to CSV
    const csvWriter = new CSVWriter(config.outputFile);
    await csvWriter.writeReelsData(reelsData);

    console.log('\n🎉 Scraping completed successfully!');
    console.log(`📄 Results saved to: ${csvWriter.getOutputPath()}`);
    
    // Display sample data
    if (reelsData.length > 0) {
      console.log('\n📝 Sample of scraped data:');
      const sample = reelsData.slice(0, 3);
      sample.forEach((reel, index) => {
        console.log(`   ${index + 1}. ${reel.username} - ${reel.viewCount} views | ${reel.likes} likes | ${reel.comments} comments`);
        console.log(`      URL: ${reel.href}`);
      });
      
      if (reelsData.length > 3) {
        console.log(`   ... and ${reelsData.length - 3} more reels`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error occurred during scraping:');
    console.error(error);
    process.exit(1);
  } finally {
    // Clean up
    if (scraper) {
      await scraper.close();
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n⚠️ Process interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️ Process terminated');
  process.exit(0);
});

// Start the application
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
} 