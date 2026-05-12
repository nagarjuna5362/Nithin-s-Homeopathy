const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html, { recognizeSelfClosing: true });
fs.writeFileSync('index.html', $.html(), 'utf8');
console.log('Fixed HTML tags');
