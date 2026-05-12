const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('id="doctors"')) console.log(i + 1, l.trim());
  if (l.includes('class="fc fca"')) console.log(i + 1, l.trim());
  if (l.includes('class="fc fcb"')) console.log(i + 1, l.trim());
});
