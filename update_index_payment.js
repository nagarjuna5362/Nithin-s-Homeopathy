const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `.then(function () {
                    showPS("psOk");
                    updateCounters("payment_success");`;

const replaceStr = `.then(async function () {
                    showPS("psOk");
                    updateCounters("payment_success");
                    
                    // Save to Firestore
                    if (window.currentUser && window.firebaseDb) {
                      try {
                        const { setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
                        await setDoc(doc(window.firebaseDb, "users", window.currentUser.uid), {
                          purchasedPlan: curPlan,
                          woman: woman,
                          man: man,
                          email: e,
                          phone: ph,
                          area: area,
                          purchaseDate: new Date().toISOString()
                        }, { merge: true });
                        // Trigger UI update
                        window.updatePricingUI && window.updatePricingUI(curPlan, "#");
                      } catch (err) {
                        console.error("Firestore save error:", err);
                      }
                    }`;

html = html.replace(targetStr, replaceStr);

// I must also make updatePricingUI global so it can be called from here
html = html.replace('function updatePricingUI(planName, invoiceUrl) {', 'window.updatePricingUI = function(planName, invoiceUrl) {');

fs.writeFileSync('index.html', html, 'utf8');
console.log("Payment success logic updated");
