const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const overrideStyles = `
<style>
  /* HERO SECTION OVERRIDES to ensure everything is aligned and visible */
  #hero {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 2rem !important;
    min-height: auto !important;
    padding-top: 150px !important;
    padding-bottom: 50px !important;
  }
  #hero > div:not(.blob) {
    flex: 1 1 400px !important;
    max-width: 500px !important;
    transform: none !important; /* Ensure it's not pushed off screen */
  }
  .hero-vis {
    order: 0 !important;
  }
  
  /* FLOATING STATS OVERLAP FIX */
  .fc.fca { left: -1rem !important; bottom: 2rem !important; }
  .fc.fcb { right: -1rem !important; top: 3rem !important; }
  
  /* ROADMAP OVERLAP FIX */
  .ph-bg { opacity: 0.15 !important; z-index: 0 !important; }
  .phase * { position: relative; z-index: 1; }
  
  /* REMOVE DUPLICATE DOCTOR LABELS */
  .doc-label { display: none !important; }
  
  /* PREVENT COLLAPSING */
  section {
    width: 100% !important;
    overflow: hidden !important;
  }
</style>
`;

html = html.replace('</body>', overrideStyles + '\n</body>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Overrides applied');
