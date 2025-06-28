#!/usr/bin/env node

import { HTMLReelsParser } from './htmlParser';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🎬 Instagram Reels HTML Parser\n');

  try {
    // Check if HTML file path is provided as argument
    const htmlFilePath = process.argv[2];
    
    if (!htmlFilePath) {
      console.log('📝 Usage Instructions:');
      console.log('1. Save the Instagram page HTML to a file (e.g., "instagram_page.html")');
      console.log('2. Run: npm run parse [html-file-path]');
      console.log('   Example: npm run parse instagram_page.html');
      console.log('\n💡 To get HTML:');
      console.log('   - Open Instagram reels page in browser');
      console.log('   - Scroll to load all content');
      console.log('   - Right-click → Inspect → Elements tab');
      console.log('   - Right-click on <html> tag → Copy → Copy outerHTML');
      console.log('   - Save to a .html file');
      process.exit(1);
    }

    // Check if file exists
    if (!fs.existsSync(htmlFilePath)) {
      console.error(`❌ File not found: ${htmlFilePath}`);
      process.exit(1);
    }

    const outputFile = `parsed_reels_${Date.now()}.csv`;
    
    console.log(`📁 Input file: ${htmlFilePath}`);
    console.log(`📄 Output file: ${outputFile}\n`);

    // Initialize parser and load HTML
    const parser = new HTMLReelsParser();
    parser.loadFromFile(htmlFilePath);

    // Extract reels
    const reels = parser.extractReels();

    if (reels.length === 0) {
      console.log('⚠️ No reels found in the HTML file.');
      console.log('   - Make sure the HTML contains Instagram reel content');
      console.log('   - Check that you copied the complete page HTML');
      process.exit(1);
    }

    // Get statistics
    const stats = parser.getParsingStats(reels);
    console.log('\n📊 Parsing Statistics:');
    console.log(`   - Total reels found: ${stats.totalReels}`);
    console.log(`   - Reels with view counts: ${stats.reelsWithViewCounts}`);
    console.log(`   - Reels without view counts: ${stats.reelsWithoutViewCounts}`);
    console.log(`   - Unique users: ${stats.uniqueUsers}`);
    console.log(`   - Average view count: ${stats.avgViewCount}`);

    // Save to CSV
    await parser.saveToCSV(reels, outputFile);

    // Show sample data
    console.log('\n📝 Sample extracted data:');
    const sample = reels.slice(0, 5);
    sample.forEach((reel, index) => {
      console.log(`   ${index + 1}. ${reel.username || 'Unknown'} - ${reel.viewCount} views`);
      console.log(`      ${reel.href}`);
    });
    
    if (reels.length > 5) {
      console.log(`   ... and ${reels.length - 5} more reels`);
    }

    console.log(`\n🎉 Success! Data saved to: ${outputFile}`);

  } catch (error) {
    console.error('\n❌ Error occurred:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
} 