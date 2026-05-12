const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The file currently starts with:
// <html lang="en"><head></head><body>﻿
//
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">

// Remove the incorrect head/body tags at the beginning
html = html.replace(/<html lang="en"><head><\/head><body>\uFEFF/, '');
html = html.replace(/<html lang="en"><head><\/head><body>/, '');
html = html.replace(/^\uFEFF/, ''); // Remove BOM if present

// Find the first <style> tag to separate head and body if needed, or just look for </style> and insert </head><body> after it
const headEndMatch = html.indexOf('</style>');
if (headEndMatch !== -1) {
    const splitIndex = headEndMatch + '</style>'.length;
    let headContent = html.substring(0, splitIndex);
    let bodyContent = html.substring(splitIndex);
    
    // remove trailing </body></html>
    bodyContent = bodyContent.replace(/<\/body><\/html>$/i, '');
    
    const newHtml = `<!DOCTYPE html>
<html lang="en">
<head>
${headContent}
</head>
<body>
${bodyContent}
</body>
</html>`;
    
    fs.writeFileSync('index.html', newHtml, 'utf8');
    console.log('Fixed HTML structure');
} else {
    console.log('Could not find </style>');
}
