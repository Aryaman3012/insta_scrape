# Instagram Reels Scraper

A TypeScript-based web scraper that automates the process of collecting Instagram reels data including URLs and view counts. The scraper uses Puppeteer to control a Chrome browser, handles login automation, infinite scrolling, and exports data to CSV format.

## Features

- 🚀 **Automated Browser Control**: Uses Puppeteer to control Chrome browser
- 🔐 **Instagram Login**: Handles automated login with your credentials  
- 📜 **Infinite Scrolling**: Automatically scrolls to load more reels content
- 🎯 **Targeted Data Extraction**: Extracts reel URLs and view counts
- 📊 **CSV Export**: Saves scraped data to CSV with detailed statistics
- ⚡ **Performance Optimized**: Blocks images/videos for faster scraping
- 🛡️ **Error Handling**: Comprehensive error handling and logging

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Chrome browser installed

## Installation

1. **Clone or setup the project:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure your credentials in `.env`:**
   ```env
   INSTAGRAM_USERNAME=your_instagram_username
   INSTAGRAM_PASSWORD=your_instagram_password
   TARGET_URL=https://www.instagram.com/explore/reels/
   OUTPUT_FILE=scraped_reels.csv
   SCROLL_DELAY=2000
   MAX_SCROLLS=50
   ```

## Usage

### Build and Run
```bash
# Build the TypeScript code
npm run build

# Run the scraper
npm start
```

### Development Mode
```bash
# Run directly with ts-node
npm run dev
```

## Configuration Options

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `INSTAGRAM_USERNAME` | Your Instagram username | **Required** | `your_username` |
| `INSTAGRAM_PASSWORD` | Your Instagram password | **Required** | `your_password` |
| `TARGET_URL` | Page to scrape reels from | `explore/reels` | `https://www.instagram.com/username/reels/` |
| `OUTPUT_FILE` | CSV output filename | `scraped_reels.csv` | `my_reels_data.csv` |
| `SCROLL_DELAY` | Delay between scrolls (ms) | `2000` | `3000` |
| `MAX_SCROLLS` | Maximum scroll attempts | `50` | `100` |

## Output Format

The scraper generates a CSV file with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| `Reel URL` | Relative Instagram reel path | `/username/reel/ABC123/` |
| `View Count` | Number of views | `11.6K` |
| `Username` | Creator's username | `redditor.boy` |
| `Reel ID` | Unique reel identifier | `DLFzzE_o6lB` |
| `Full Instagram URL` | Complete Instagram URL | `https://www.instagram.com/username/reel/ABC123/` |

## How It Works

1. **Browser Initialization**: Launches Chrome with optimized settings
2. **Instagram Login**: Navigates to login page and authenticates
3. **Target Navigation**: Goes to specified Instagram page
4. **Content Loading**: Scrolls down repeatedly to load more reels
5. **Data Extraction**: Finds reel links and view count spans using CSS selectors
6. **Deduplication**: Removes duplicate entries
7. **CSV Export**: Saves cleaned data to CSV file

## Selectors Used

The scraper targets these specific elements:
- **Reel Links**: `a[href*="/reel/"]`
- **View Counts**: `span.html-span.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x1hl2dhg.x16tdsg8.x1vvkbs`

## Troubleshooting

### Common Issues

**No reels found:**
- Check if the target URL is accessible and contains reels
- Verify Instagram credentials are correct
- Try increasing `SCROLL_DELAY` for slower networks

**Login failures:**
- Ensure credentials are correct in `.env` file
- Instagram may require manual verification - run in non-headless mode
- Consider using app-specific passwords if 2FA is enabled

**Performance issues:**
- Reduce `MAX_SCROLLS` for faster execution
- Increase `SCROLL_DELAY` if content isn't loading properly
- Images/videos are blocked by default for better performance

### Debug Mode

To run in visible browser mode for debugging:
- Edit `src/scraper.ts`
- Change `headless: false` to `headless: true`

## Legal and Ethical Considerations

⚠️ **Important**: This tool is for educational purposes only. Please ensure you:

- Comply with Instagram's Terms of Service
- Respect rate limits and don't overload Instagram's servers  
- Only scrape public content you have permission to access
- Use scraped data responsibly and in accordance with applicable laws

## Project Structure

```
├── src/
│   ├── index.ts          # Main application entry point
│   ├── scraper.ts        # Instagram scraping logic
│   ├── csvWriter.ts      # CSV export functionality  
│   ├── config.ts         # Configuration management
│   └── types.ts          # TypeScript interfaces
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - see LICENSE file for details. 