const fs = require('fs');
const cheerio = require('cheerio');

let html = fs.readFileSync('index.html', 'utf8');

// We can just use string replacements for CSS
html = html.replace('.fca {\n        bottom: 1.8rem;\n        left: -2rem;', '.fca {\n        bottom: 1.8rem;\n        left: 0rem;');
html = html.replace('.fcb {\n        top: 2.5rem;\n        right: -1.8rem;', '.fcb {\n        top: 2.5rem;\n        right: 0rem;');

// Sticky Header fix
html = html.replace('section {\n        padding: 88px 5%;\n      }', 'section {\n        padding: 88px 5%;\n        scroll-margin-top: calc(var(--nav) + 20px);\n      }');

// Roadmap number overlap fix
html = html.replace('.ph-bg {\n        position: absolute;\n        top: 0.8rem;\n        right: 1rem;\n        font-family: "Playfair Display", serif;\n        font-size: 4rem;\n        font-weight: 700;\n        color: var(--r50);\n        line-height: 1;\n        pointer-events: none;\n      }', '.ph-bg {\n        position: absolute;\n        top: 0.8rem;\n        right: 1rem;\n        font-family: "Playfair Display", serif;\n        font-size: 4rem;\n        font-weight: 700;\n        color: var(--r50);\n        line-height: 1;\n        pointer-events: none;\n        opacity: 0.4;\n        z-index: 0;\n      }\n      .phase * { position: relative; z-index: 1; }');

// We also use cheerio to remove .doc-label
const $ = cheerio.load(html);
$('.doc-label').remove();

fs.writeFileSync('index.html', $.html(), 'utf8');
console.log('Applied layout fixes');
