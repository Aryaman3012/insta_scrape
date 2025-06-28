# 📄 HTML Parser for Instagram Reels

This is a standalone tool that extracts reels data from saved HTML content, eliminating all timing and automation detection issues.

## 🚀 Quick Start

### Step 1: Get the HTML
1. **Open Instagram reels page** in your browser (e.g., `https://www.instagram.com/redditor.boy/reels/`)
2. **Scroll down** to load ALL the reels you want to scrape
3. **Right-click** → **Inspect** (or press F12)
4. In the **Elements** tab, find the `<html>` tag (top of the tree)
5. **Right-click** on `<html>` → **Copy** → **Copy outerHTML**
6. **Save** this content to a file (e.g., `instagram_page.html`)

### Step 2: Run the Parser
```bash
npm run parse instagram_page.html
```

### Step 3: Get Results
- CSV file will be created with timestamp: `parsed_reels_1234567890.csv`
- All reels with view counts will be extracted and converted

## ✅ Advantages

- **100% Success Rate**: No timing issues or failed automation
- **All Reels Captured**: Gets exactly what you see in the browser
- **No Detection**: Uses static HTML, no browser automation
- **Multiple Strategies**: Robust extraction with fallback methods
- **View Count Conversion**: Automatically converts "11.6K" → "11600"

## 📊 Output

The CSV includes:
- **Reel URL**: Instagram reel path
- **View Count**: Numeric view count (K/M converted to numbers)
- **Username**: Creator's username
- **Reel ID**: Unique reel identifier
- **Full Instagram URL**: Complete clickable URL

## 🔧 Advanced Usage

### Multiple Files
```bash
npm run parse page1.html
npm run parse page2.html
npm run parse page3.html
```

### Different Output Names
The parser automatically creates unique filenames with timestamps to avoid conflicts.

## 🎯 When to Use This vs Browser Automation

**Use HTML Parser when:**
- ✅ You want 100% reliability
- ✅ You can manually scroll/load content
- ✅ You want to avoid automation detection
- ✅ You need to verify exactly what gets scraped

**Use Browser Automation when:**
- ✅ You want fully automated process
- ✅ You have stable network/timing
- ✅ You're scraping regularly/repeatedly

## 📝 Example Workflow

1. **Load page**: `https://www.instagram.com/redditor.boy/reels/`
2. **Scroll**: Until you see all desired reels loaded
3. **Copy HTML**: Right-click `<html>` → Copy outerHTML
4. **Save**: Paste into `reels_data.html`
5. **Parse**: `npm run parse reels_data.html`
6. **Result**: `parsed_reels_1234567890.csv` with all data

## 🔍 Extraction Strategies

The parser uses multiple strategies to find view counts:

1. **Exact Selector Match**: Uses your provided CSS selector
2. **Container Proximity**: Searches parent containers
3. **Pattern Matching**: Finds spans with view-count-like patterns
4. **Alternative Selectors**: Tries various fallback patterns

This ensures maximum capture rate even if Instagram changes their layout slightly.

## 🛠️ Troubleshooting

**No reels found:**
- Make sure you copied the complete `<html>` content
- Check that the page actually contains reels
- Try scrolling more before copying HTML

**Missing view counts:**
- Some reels might not have view counts visible
- The parser will still capture the reel with "0" as placeholder

**Duplicate entries:**
- The parser automatically deduplicates based on reel URL
- Same reel won't appear multiple times 