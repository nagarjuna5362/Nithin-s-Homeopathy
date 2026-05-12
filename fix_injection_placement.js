const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The block to extract starts with:
// <style>
//   /* HERO SECTION OVERRIDES to ensure everything is aligned and visible */
// and ends with:
//   }
// </script>

const startStr = `<style>
  /* HERO SECTION OVERRIDES`;

const endStr = `    });
  }
</script>`;

const startIndex = html.indexOf(startStr);
const endIndex = html.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
    // Extract the block
    const injectedCode = html.substring(startIndex, endIndex);
    
    // Remove the block from its current bad location
    html = html.substring(0, startIndex) + html.substring(endIndex);
    
    // Find the LAST </body>
    const lastBodyIndex = html.lastIndexOf('</body>');
    
    if (lastBodyIndex !== -1) {
        // Insert it right before the last </body>
        html = html.substring(0, lastBodyIndex) + '\n' + injectedCode + '\n' + html.substring(lastBodyIndex);
        fs.writeFileSync('index.html', html, 'utf8');
        console.log('Fixed the injected code placement!');
    } else {
        console.log('Could not find the last </body>');
    }
} else {
    console.log('Could not find the injected block to move.');
}
