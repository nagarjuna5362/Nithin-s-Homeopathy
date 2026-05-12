const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Firebase SDK and Auth UI script right before closing </body>
const firebaseScript = `
<!-- Firebase Auth Modal -->
<div id="auth-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; align-items: center; justify-content: center;">
  <div style="background: white; padding: 2rem; border-radius: 16px; max-width: 400px; width: 90%; text-align: center; position: relative;">
    <button onclick="document.getElementById('auth-modal').style.display='none'" style="position: absolute; right: 1rem; top: 1rem; background: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
    <h3 style="margin-bottom: 1rem; font-family: 'Playfair Display', serif; font-size: 1.5rem;">Login or Sign Up</h3>
    <p style="margin-bottom: 1.5rem; font-size: 0.9rem; color: #5a4655;">Please log in to reserve your spot and proceed with the payment.</p>
    
    <div id="recaptcha-container"></div>
    
    <button id="btn-google-login" style="width: 100%; padding: 12px; margin-bottom: 10px; background: #fff; border: 1px solid #ccc; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width:18px;"> Continue with Google
    </button>
    
    <div style="margin: 15px 0; color: #999; font-size: 0.8rem;">OR</div>
    
    <input type="email" id="auth-email" placeholder="Email Address" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 8px;">
    <input type="password" id="auth-password" placeholder="Password" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 8px;">
    <button id="btn-email-login" style="width: 100%; padding: 12px; margin-bottom: 10px; background: #d4648f; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Login / Sign Up with Email</button>
    
    <div style="margin: 15px 0; color: #999; font-size: 0.8rem;">OR PHONE</div>
    
    <input type="tel" id="auth-phone" placeholder="+91 9876543210" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 8px;">
    <button id="btn-phone-login" style="width: 100%; padding: 12px; background: #25D366; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Send OTP to Phone</button>
  </div>
</div>

<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
  import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyBszdI2g0gTSdSWZ-bCog0svaxZuhaL8us",
    authDomain: "luminest-76ee7.firebaseapp.com",
    projectId: "luminest-76ee7",
    storageBucket: "luminest-76ee7.firebasestorage.app",
    messagingSenderId: "487133870075",
    appId: "1:487133870075:web:c1fe10a170a40764863d5e"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  window.firebaseAuth = auth;
  window.firebaseDb = db;
  window.currentUser = null;
  window.pendingPlanToBuy = null;

  // Listen for auth state
  onAuthStateChanged(auth, async (user) => {
    window.currentUser = user;
    if (user) {
      document.getElementById('auth-modal').style.display = 'none';
      
      // If they were trying to buy a plan, open payment now
      if (window.pendingPlanToBuy) {
        window.continueToPayment(window.pendingPlanToBuy);
        window.pendingPlanToBuy = null;
      }
      
      // Check if user already bought a plan
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().purchasedPlan) {
        const plan = userDoc.data().purchasedPlan;
        updatePricingUI(plan, userDoc.data().invoiceUrl);
      }
    }
  });

  // Google Login
  document.getElementById('btn-google-login').onclick = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(err => alert(err.message));
  };

  // Email Login
  document.getElementById('btn-email-login').onclick = () => {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => {
      if(err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        createUserWithEmailAndPassword(auth, email, pass).catch(e => alert(e.message));
      } else {
        alert(err.message);
      }
    });
  };

  // Phone Login (Simplified)
  let confirmationResult;
  document.getElementById('btn-phone-login').onclick = () => {
    const phoneNumber = document.getElementById('auth-phone').value;
    if(!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    }
    
    if (document.getElementById('btn-phone-login').innerText === 'Send OTP to Phone') {
      signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
        .then((result) => {
          confirmationResult = result;
          document.getElementById('btn-phone-login').innerText = 'Verify OTP';
          document.getElementById('auth-phone').placeholder = 'Enter OTP';
          document.getElementById('auth-phone').value = '';
        }).catch(err => alert(err.message));
    } else {
      const code = document.getElementById('auth-phone').value;
      confirmationResult.confirm(code).catch(err => alert(err.message));
    }
  };

  function updatePricingUI(planName, invoiceUrl) {
    const cards = document.querySelectorAll('.pcard');
    cards.forEach(card => {
      const title = card.querySelector('.h3') ? card.querySelector('.h3').innerText : '';
      if(title.includes('Full Program') && planName === 'full') {
        const btn = card.querySelector('.btn-p');
        if(btn) {
          btn.innerText = "This is your plan";
          btn.style.background = "#25D366";
          btn.onclick = null;
          
          const invoiceBtn = document.createElement('a');
          invoiceBtn.href = invoiceUrl || "#";
          invoiceBtn.innerText = "📄 View Invoice";
          invoiceBtn.className = "btn-o";
          invoiceBtn.style.marginTop = "10px";
          invoiceBtn.style.display = "block";
          invoiceBtn.style.textAlign = "center";
          btn.parentElement.appendChild(invoiceBtn);
        }
      }
    });
  }
</script>
`;

html = html.replace('</body>', firebaseScript + '\n</body>');

// 2. Modify openPay to trigger auth modal
const oldOpenPay = `function openPay(plan) {
        curPlan = plan || "full";`;
        
const newOpenPay = `
      window.continueToPayment = function(plan) {
        curPlan = plan || "full";
        var price = PRICES[curPlan] || 0;
        var fmt = "₹" + price.toLocaleString("en-IN");
        document.getElementById("payAmt").textContent = price > 0 ? fmt : "Free";
        document.getElementById("btnAmt").textContent = price > 0 ? fmt : "Register Free";
        document.querySelector("#payForm .pay-sub").textContent = PLAN_NAMES[curPlan] || "LumiNest Enrollment";
        resetPay();
        document.getElementById("payment").scrollIntoView({ behavior: "smooth" });
      };

      function openPay(plan) {
        if (!window.currentUser) {
          window.pendingPlanToBuy = plan;
          document.getElementById('auth-modal').style.display = 'flex';
          return;
        }
        window.continueToPayment(plan);
`;

html = html.replace(oldOpenPay, newOpenPay);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Firebase frontend script injected');
