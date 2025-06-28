const fs = require('fs');
const beautify = require('js-beautify').html;

// Get input and output file names from command line arguments
const inputFile = process.argv[2] || 'page.html';
const outputFile = process.argv[3] || 'page_formatted_proper.html';

try {
    console.log(`📖 Reading: ${inputFile}`);
    
    // Read the HTML content
    const htmlContent = fs.readFileSync(inputFile, 'utf8');
    console.log(`📏 Original size: ${Math.round(htmlContent.length / 1024)} KB`);
    
    // Format the HTML with proper indentation and structure
    const formattedHtml = beautify(htmlContent, {
        indent_size: 2,                    // 2 spaces for indentation
        indent_char: ' ',                  // Use spaces
        max_preserve_newlines: 2,          // Maximum consecutive newlines
        preserve_newlines: true,           // Preserve existing newlines where appropriate
        keep_array_indentation: false,     // Don't preserve array indentation
        break_chained_methods: false,      // Don't break chained methods
        indent_scripts: 'normal',          // Indent <script> content normally
        brace_style: 'collapse',           // Brace style for any inline JS
        space_before_conditional: true,    // Space before conditionals
        unescape_strings: false,           // Don't unescape strings
        jslint_happy: false,              // Don't try to make JSLint happy
        end_with_newline: true,           // End with newline
        wrap_line_length: 120,            // Wrap lines at 120 characters
        wrap_attributes: 'auto',          // Wrap attributes automatically
        wrap_attributes_indent_size: 2,   // Indent wrapped attributes
        unformatted: ['pre', 'code'],     // Don't format these tags
        content_unformatted: ['pre', 'script', 'style'], // Don't format content of these tags
        extra_liners: ['head', 'body', '/html'] // Extra line breaks around these tags
    });
    
    // Write the formatted HTML
    fs.writeFileSync(outputFile, formattedHtml);
    
    console.log(`✨ Formatted HTML saved to: ${outputFile}`);
    console.log(`📏 Formatted size: ${Math.round(formattedHtml.length / 1024)} KB`);
    
    // Count lines for comparison
    const originalLines = htmlContent.split('\n').length;
    const formattedLines = formattedHtml.split('\n').length;
    
    console.log(`📊 Lines: ${originalLines} → ${formattedLines}`);
    console.log(`🎉 Done! Your HTML is now properly formatted with indentation.`);
    
} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
} 