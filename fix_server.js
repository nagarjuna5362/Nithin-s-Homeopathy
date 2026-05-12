const fs = require('fs');
let lines = fs.readFileSync('server.js', 'utf8').split('\n');

// We want to remove lines 265 to 321 (0-indexed 264 to 320)
// The correct sendWhatsAppNotification ends at line 263.
// The correct SEND INVOICE EMAIL starts at line 322.
lines.splice(264, 321 - 265 + 1);

fs.writeFileSync('server.js', lines.join('\n'), 'utf8');
console.log('Fixed server.js');
