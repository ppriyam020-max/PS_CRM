/**
 * Kisan Bandhu - Master Web App Controller
 * Features: Dark Mode, Multi-Language (Hindi/English), Geo Map, Live Queue, Slot Booking, AI Chatbot
 */


// Application State & Settings
const state = {
  currentView: 'landing',
  theme: localStorage.getItem('kb_theme') || 'light',
  lang: localStorage.getItem('kb_lang') || 'hi', // default to Hindi for all farmers
  currentUser: {
    name: 'Priyam Prajapati',
    farmerId: '#RB10240',
    token: '#1024',

    // LIVE PROCUREMENT DETAILS
    crop: 'Wheat (Kanak)',
    center: 'Meerut Central Mandi',
    date: '',
    slotTime: '10:00 AM - 11:00 AM',
    quantity: '45 Quintals',
    queuePos: 12,
    totalQueue: 45,
    estimatedWait: 25,
    status: 'Confirmed'
  },
  selectedSlot: '10:00 AM - 11:00 AM',
  notificationsFilter: 'all',
  notifications: [
    {
      id: 1,
      type: 'sms',
      titleEn: 'Slot Confirmation',
      titleHi: 'स्लॉट पुष्टि',
      messageEn: 'Your procurement slot has been confirmed.',
      messageHi: 'आपका फसल खरीद स्लॉट कन्फर्म हो गया है।',//first kisan is entered in the quque
      time: '10:00 AM • SMS'
    },
    {
      id: 2,
      type: 'system',
      titleEn: 'Queue Update',
      titleHi: 'कतार अपडेट',
      messageEn: 'Your queue number is #1024. Current position: 12',
      messageHi: 'आपका टोकन #1024 है। वर्तमान कतार नंबर: 12',//second kisan is entered in the queue
      time: '09:45 AM • System'
    },
    {
      id: 3,
      type: 'whatsapp',
      titleEn: 'Payment Status',
      titleHi: 'भुगतान स्थिति',
      messageEn: 'Your payment for Token #1003 is completed.',
      messageHi: 'टोकन #1003 के लिए आपका भुगतान पूरा हो चुका है।',
      time: 'Yesterday • WhatsApp'
    }
  ],
  adminBookings: [
    { token: '#1024', farmer: 'Priyam Prajapati', crop: 'Wheat', slot: '10:00 AM - 11:00 AM', status: 'Confirmed' },
    { token: '#1025', farmer: 'Priyanshu Singh', crop: 'Rice', slot: '10:00 AM - 11:00 AM', status: 'Waiting' },
    { token: '#1026', farmer: 'Utkarsh Pratap Singh', crop: 'Wheat', slot: '11:00 AM - 12:00 PM', status: 'Confirmed' },
    { token: '#1027', farmer: 'Mohan Lal', crop: 'Maize', slot: '11:00 AM - 12:00 PM', status: 'Pending' },
    { token: '#1028', farmer: 'Ravi Patel', crop: 'Wheat', slot: '12:00 PM - 01:00 PM', status: 'Confirmed' }
  ],
  adminCenters: [
    { name: 'Meerut Central Mandi', location: 'Meerut, Uttar Pradesh', crop: 'Wheat', capacity: 500, maxFarmers: 100 }
  ]
};

// ==========================================================================
// TRANSLATION DICTIONARY (HINDI & ENGLISH)
// ==========================================================================
const i18n = {
  en: {
    brand_title: "KISAN BANDHU",
    nav_home: "Home",
    nav_features: "Features",
    nav_how_it_works: "How It Works",
    nav_ai: "AI Assistant",
    nav_contact: "Contact",
    btn_login: "Login",
    btn_register: "Register",
    hero_title: "Smart Procurement.<br>Zero Waiting.",
    hero_sub: "Book your procurement slot, track your queue in real-time and receive instant updates. All in one platform for farmers.",
    btn_book_slot: "Book Your Slot",
    btn_explore_portal: "Explore Portal",
    stat_farmers: "Farmers Registered",
    stat_centers: "Procurement Centers",
    stat_slots: "Slots Booked",
    stat_satisfaction: "Farmer Satisfaction",
    sec_features_title: "Everything Farmers Need 🌾",
    sec_features_sub: "Making procurement simple, transparent and efficient.",
    feat1_title: "Smart Slot Booking",
    feat1_desc: "Book your preferred time slot in advance and save time without standing in long mandi lines.",
    feat2_title: "Live Queue Tracking",
    feat2_desc: "Track your real-time queue position and estimated waiting time directly from your mobile.",
    feat3_title: "QR-Based Entry",
    feat3_desc: "Fast and secure contactless entry using your digital QR code pass at procurement centers.",
    feat4_title: "Instant Notifications",
    feat4_desc: "Get critical real-time status updates via SMS and WhatsApp about your turn and payouts.",
    sec_how_title: "How It Works",
    sec_how_sub: "Simple steps for a hassle-free procurement experience.",
    step1_title: "Register",
    step1_desc: "Create your farmer account in minutes.",
    step2_title: "Book Slot",
    step2_desc: "Choose center, date and time slot.",
    step3_title: "Get QR Code",
    step3_desc: "Receive digital gate entry pass.",
    step4_title: "Procurement",
    step4_desc: "Scan QR pass & sell crops hassle-free.",
    ai_title: "Your AI Farming Assistant 🤖",
    ai_sub: "Get instant answers about slots, required documents, MSP rates, and queue status 24/7.",
    dash_welcome: "Welcome back",
    metric_token: "Token Number",
    metric_queue: "Queue Position",
    metric_wait: "Est. Waiting Time",
    metric_status: "Booking Status",
    metric_status_val: "Confirmed",
    todays_procurement: "Today's Procurement",
    crop_label: "Crop",
    center_label: "Procurement Center",
    date_label: "Date",
    slot_time_label: "Slot Time",
    btn_google_maps: "View Mandi Route on Google Maps",
    btn_view_full_pass: "View Full Screen Pass",
    quick_actions: "Quick Actions",
    qa_book_slot: "Book New Slot",
    qa_live_queue: "Live Queue",
    qa_payment: "Payment Status",
    qa_farmer_pass: "Farmer Pass",
    btn_confirm_booking: "Confirm Booking"
  },
  hi: {
    brand_title: "किसान बंधु",
    nav_home: "होम",
    nav_features: "विशेषताएं",
    nav_how_it_works: "यह कैसे काम करता है",
    nav_ai: "AI सहायक",
    nav_contact: "संपर्क",
    btn_login: "लॉगिन",
    btn_register: "रजिस्टर करें",
    hero_title: "स्मार्ट फसल खरीद।<br>जीरो वेटिंग।",
    hero_sub: "अपनी फसल खरीद का स्लॉट बुक करें, लाइव कतार ट्रैक करें और तुरंत अपडेट पाएं। किसानों के लिए एक संपूर्ण डिजिटल मंच।",
    btn_book_slot: "अपना स्लॉट बुक करें",
    btn_explore_portal: "पोर्टल देखें",
    stat_farmers: "पंजीकृत किसान",
    stat_centers: "खरीद केंद्र (मंडी)",
    stat_slots: "बुक किए गए स्लॉट",
    stat_satisfaction: "किसान संतुष्टि दर",
    sec_features_title: "किसानों के लिए सब कुछ 🌾",
    sec_features_sub: "फसल खरीद को सरल, पारदर्शी और तेज बनाना।",
    feat1_title: "स्मार्ट स्लॉट बुकिंग",
    feat1_desc: "मंडी में लंबी लाइनों में खड़े हुए बिना पहले से अपना पसंदीदा समय स्लॉट बुक करें।",
    feat2_title: "लाइव कतार ट्रैकिंग",
    feat2_desc: "अपने मोबाइल से अपनी वास्तविक कतार स्थिति और अनुमानित प्रतीक्षा समय ट्रैक करें।",
    feat3_title: "QR-आधारित डिजिटल एंट्री",
    feat3_desc: "खरीद केंद्र के गेट पर डिजिटल QR पास स्कैन कराकर बिना किसी देरी के तुरंत एंट्री पाएं।",
    feat4_title: "तुरंत सूचनाएं (Alerts)",
    feat4_desc: "अपनी बारी और बैंक खाते में भुगतान की सूचना सीधे SMS और WhatsApp पर पाएं।",
    sec_how_title: "यह कैसे काम करता है",
    sec_how_sub: "आसान और परेशानी मुक्त खरीद प्रक्रिया।",
    step1_title: "रजिस्टर करें",
    step1_desc: "कुछ ही मिनटों में अपना किसान खाता बनाएं।",
    step2_title: "स्लॉट चुनें",
    step2_desc: "मंडी केंद्र, फसल, तारीख और समय चुनें।",
    step3_title: "QR कोड पाएं",
    step3_desc: "फोन पर अपना डिजिटल गेट पास प्राप्त करें।",
    step4_title: "फसल बेचें",
    step4_desc: "मंडी जाएं, QR दिखाएं और तुलाई कराएं।",
    ai_title: "आपका AI किसान सहायक 🤖",
    ai_sub: "स्लॉट, जरूरी दस्तावेज, MSP भाव और कतार की जानकारी 24/7 अपनी भाषा में पूछें।",
    dash_welcome: "स्वागत है",
    metric_token: "टोकन नंबर",
    metric_queue: "कतार में स्थान",
    metric_wait: "अनुमानित समय",
    metric_status: "बुकिंग स्थिति",
    metric_status_val: "कन्फर्म",
    todays_procurement: "आज की खरीद डिटेल्स",
    crop_label: "फसल",
    center_label: "खरीद केंद्र (मंडी)",
    date_label: "तारीख",
    slot_time_label: "स्लॉट का समय",
    btn_google_maps: "गूगल मैप पर मंडी का रास्ता देखें",
    btn_view_full_pass: "फुल स्क्रीन QR पास देखें",
    quick_actions: "त्वरित सेवाएं",
    qa_book_slot: "नया स्लॉट बुक करें",
    qa_live_queue: "लाइव कतार देखें",
    qa_payment: "भुगतान स्थिति",
    qa_farmer_pass: "किसान पास",
    btn_confirm_booking: "बुकिंग कन्फर्म करें"
  }
};

// ==========================================================================
// INITIALIZER
// ==========================================================================

// ==========================================================================
// THEME (DARK / LIGHT MODE) MANAGER - 100% WORKING
// ==========================================================================
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('kb_theme', state.theme);
  applyTheme(state.theme);
}

function applyTheme(theme) {
  // <html> और <body> दोनों पर डार्क थीम लगाएं
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);

  // बटन का टेक्स्ट और आइकन बदलें
  const themeBtns = document.querySelectorAll('.theme-toggle-btn');
  themeBtns.forEach(btn => {
    btn.innerHTML = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  });
}

// Global window पर जोड़ें ताकि HTML का onclick बटन काम करे
window.toggleTheme = toggleTheme;
window.applyTheme = applyTheme;

// ==========================================================================
// LANGUAGE (HINDI / ENGLISH) MANAGER
// ==========================================================================
function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('kb_lang', lang);
  applyLanguage(lang);
  renderNotifications();
}

function applyLanguage(lang) {
  const dict = i18n[lang] || i18n.en;

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Update language toggle buttons text/active
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// ==========================================================================
// VIEW NAVIGATION ROUTER
// ==========================================================================

function navigate(viewName, sectionId) {


  state.currentView = viewName;
  window.navigate = navigate;


  // ==========================================================
  // LANDING PAGE SECTIONS
  // ==========================================================

  const landingSections = {
    home: 'hero',
    landing: 'hero',
    features: 'features',
    'how-it-works': 'how-it-works',
    ai: 'ai-assistant',
    contact: 'contact'
  };

  if (landingSections[viewName]) {

    document.querySelectorAll('.view-panel').forEach(view => {
      view.style.display = 'none';
    });

    const landingView =
      document.getElementById('view-landing');

    if (landingView) {
      landingView.style.display = 'block';
    }

    const publicHeader =
      document.querySelector('.public-header');

    const appLayout =
      document.querySelector('.app-layout');

    if (publicHeader) {
      publicHeader.style.display = 'block';
    }

    if (appLayout) {
      appLayout.style.display = 'none';
    }

    const targetSectionId =
  sectionId || landingSections[viewName];

const targetSection =
  document.getElementById(targetSectionId);
    

    if (targetSection) {

      setTimeout(() => {

        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

      }, 100);

    }

    return;
  }


  // ==========================================================
  // NORMAL PAGES
  // ==========================================================

  document.querySelectorAll('.view-panel').forEach(view => {
    view.style.display = 'none';
  });

const targetView = document.getElementById(`view-${viewName}`);

console.log("CURRENT viewName =", viewName);

if (!targetView) {
  console.warn(`View #view-${viewName} nahi mila.`);
  return;
}



  targetView.style.display = 'block';
  if (viewName === 'admin-dashboard') {
    renderAdminDashboard();
    loadAdminDataFromAPI();
}

if (viewName.startsWith('admin-') && viewName !== 'admin-dashboard') {
    const moduleName = viewName.replace('admin-', '');
    if (typeof renderAdminModule === 'function') {
        renderAdminModule(moduleName);
    }
}


  // ==========================================================
  // QR PASS
  // ==========================================================

  if (viewName === 'qr-pass') {

    setTimeout(() => {

      updateQRPassDetails();

      generateQRPass();

      // Extra retry in case CDN/library was slow
      setTimeout(() => {
        generateQRPass();
      }, 500);

      setTimeout(() => {
        generateQRPass();
      }, 1200);

    }, 100);

  }

  // ==========================================================
  // HEADER / APP LAYOUT
  // ==========================================================

  const publicHeader =
    document.querySelector('.public-header');

  const appLayout =
    document.querySelector('.app-layout');

  if (
    viewName === 'landing' ||
    viewName === 'login' ||
    viewName === 'register'
  ) {

    if (publicHeader) {
      publicHeader.style.display = 'block';
    }

    if (appLayout) {
      appLayout.style.display = 'none';
    }

  } else {

    if (publicHeader) {
      publicHeader.style.display = 'none';
    }

    if (appLayout) {
      appLayout.style.display = 'flex';
    }

  }


  // ==========================================================
  // SIDEBAR ACTIVE LINK
  // ==========================================================

  document
    .querySelectorAll(
      '.sidebar-menu a, .sidebar-menu button'
    )
    .forEach(link => {

      link.classList.toggle(
        'active',
        link.getAttribute('data-view') === viewName
      );

    });


  // ==========================================================
  // DEMO TOOLBAR
  // ==========================================================

  document
    .querySelectorAll(
      '.demo-toolbar .demo-btn'
    )
    .forEach(button => {

      button.classList.toggle(
        'active',
        button.getAttribute('data-navigate') === viewName
      );

    });


  // ==========================================================
  // MANDI MAP
  // ==========================================================

  if (viewName === 'book-slot') {

    setTimeout(() => {

      initMandiMap();

    }, 150);

  }


  // ==========================================================
  // PAGE SCROLL
  // ==========================================================

  if (sectionId) {

    setTimeout(() => {

      const section =
        document.getElementById(sectionId);

      if (section) {

        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

      }

    }, 60);

  } else {

    const mainContent = document.querySelector('.main-content');

    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    }

  }
}
// ============================================================
// REAL QR CODE GENERATION - FINAL
// ============================================================

function createQRData() {
  const user = state.currentUser;

  return JSON.stringify({
    passId: "KB-" + user.token.replace("#", ""),
    token: user.token,
    farmerId: user.farmerId,
    farmerName: user.name,
    crop: user.crop,
    center: user.center,
    date: user.date || "-",
    slotTime: user.slotTime,
    status: user.status
  });
}

// ============================================================
// QR CODE GENERATION - FIXED & RELIABLE
// ============================================================

function createQRData() {
  const user = state.currentUser || {};

  return JSON.stringify({
    passId: "KB-" + String(user.token || "#1024").replace("#", ""),
    token: user.token || "#1024",
    farmerId: user.farmerId || "#RB10240",
    farmerName: user.name || "Priyam Prajapati",
    crop: user.crop || "Wheat (Kanak)",
    center: user.center || "Meerut Central Mandi",
    date: user.date || "-",
    slotTime: user.slotTime || "10:00 AM - 11:00 AM",
    status: user.status || "Confirmed"
  });
}
function generateQRPass() {

  const dashboardQR = document.getElementById("qrcode-dashboard");
  const fullPassQR = document.getElementById("qrcode-fullpass");

  const user = state.currentUser || {};

  const qrData = JSON.stringify({
    passId: user.token
      ? "KB-" + String(user.token).replace("#", "")
      : "KB-1024",
    token: user.token || "#1024",
    farmerId: user.farmerId || "RB10240",
    farmerName: user.name || "Farmer",
    crop: user.crop || "Wheat (Kanak)",
    center: user.center || "Meerut Central Mandi",
    date: user.date || "-",
    slotTime: user.slotTime || "10:00 AM - 11:00 AM",
    status: user.status || "Confirmed"
  });

  function makeQR(container) {

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (typeof QRCode !== "undefined") {

      try {

        new QRCode(container, {
          text: qrData,
          width: 160,
          height: 160,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });

        return;

      } catch (error) {
        console.error("QR generation error:", error);
      }
    }

    const img = document.createElement("img");

    img.src =
      "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" +
      encodeURIComponent(qrData);

    img.alt = "Kisan Bandhu QR Code";
    img.width = 160;
    img.height = 160;

    img.style.width = "160px";
    img.style.height = "160px";
    img.style.display = "block";
    img.style.margin = "0 auto";

    container.appendChild(img);
  }

  makeQR(dashboardQR);
  makeQR(fullPassQR);
}
// ------------------------------------------------------------
// Retry QR after page/library loading
// ------------------------------------------------------------

function retryQRGeneration() {

  let attempts = 0;

  const timer = setInterval(() => {

    attempts++;

    const dashboardQR =
      document.getElementById("qrcode-dashboard");

    const fullPassQR =
      document.getElementById("qrcode-fullpass");

    if (
      typeof window.QRCode !== "undefined" ||
      dashboardQR ||
      fullPassQR
    ) {

      generateQRPass();

    }

    if (
      typeof window.QRCode !== "undefined" ||
      attempts >= 10
    ) {

      clearInterval(timer);

    }

  }, 500);

}

function updateQRPassDetails() {
  const user = state.currentUser;

  document.querySelectorAll(".qr-token").forEach(el => {
    el.textContent = user.token || "-";
  });

  document.querySelectorAll(".qr-crop").forEach(el => {
    el.textContent = user.crop || "-";
  });

  document.querySelectorAll(".qr-center").forEach(el => {
    el.textContent = user.center || "-";
  });

  document.querySelectorAll(".qr-date").forEach(el => {
    el.textContent = user.date || "-";
  });

  document.querySelectorAll(".qr-slot").forEach(el => {
    el.textContent = user.slotTime || "-";
  });
}
// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
function setupNavigation() {
  document.addEventListener('click', (e) => {
    const navTarget = e.target.closest('[data-navigate]');
    if (navTarget) {
      e.preventDefault();
      const destination = navTarget.getAttribute('data-navigate');

      // href me agar #section-id hai to use bhi pakdo
      const href = navTarget.getAttribute('href') || '';
      const hashMatch = href.match(/^#(.+)/);
      const sectionId = hashMatch ? hashMatch[1] : null;

    window.navigate(destination, sectionId);
    }
    window.navigate = navigate;
  });

  // ================= LOGIN TAB SWITCH =================
  function switchLoginTab(type) {
    const isFarmer = type === 'farmer';
    document.getElementById('tab-farmer-login').classList.toggle('active', isFarmer);
    document.getElementById('tab-admin-login').classList.toggle('active', !isFarmer);
    document.getElementById('form-login-farmer').style.display = isFarmer ? 'block' : 'none';
    document.getElementById('form-login-admin').style.display = isFarmer ? 'none' : 'block';
    const regLink = document.getElementById('register-link-wrap');
    if (regLink) regLink.style.display = isFarmer ? 'block' : 'none';
  }
  window.switchLoginTab = switchLoginTab;

  // ================= REUSABLE OTP LOGIN (Farmer + Admin) =================
  // ============================================================
  // FARMER LOGIN - MOBILE + OTP
  // ============================================================

  function setupFarmerOtpLogin() {

    const mobileInput = document.getElementById('farmer-mobile-number');
    const sendBtn = document.getElementById('send-otp-farmer-btn');
    const otpSection = document.getElementById('otp-section-farmer');
    const form = document.getElementById('form-login-farmer');

    if (!mobileInput || !sendBtn || !form) return;


    // -------------------------------
    // SEND OTP
    // -------------------------------

    sendBtn.addEventListener('click', async () => {

      const mobile = mobileInput.value.trim();

      if (!/^[6-9][0-9]{9}$/.test(mobile)) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }

      try {

        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mobile: mobile,
            role: 'farmer'
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {

          otpSection.style.display = 'block';
          sendBtn.style.display = 'none';

          alert('OTP sent successfully!');

        } else {

          alert(data.message || 'OTP send failed');

        }

      } catch (error) {

        console.error(error);
        alert('Backend server se connection nahi ho raha.');

      }

    });


    // -------------------------------
    // VERIFY OTP
    // -------------------------------

    form.addEventListener('submit', async (e) => {

      e.preventDefault();

      const mobile = mobileInput.value.trim();
      const otpInput = document.getElementById('farmer-otp');
      const otp = otpInput ? otpInput.value.trim() : '';

      if (!/^[0-9]{6}$/.test(otp)) {

        alert('6-digit OTP enter karo');
        return;

      }

      try {

        const response = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            mobile: mobile,
            otp: otp,
            role: 'farmer'
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {

          alert('Farmer Login Successful!');

          state.currentUser.mobile = mobile;
          state.currentUser.role = 'farmer';

          navigate('farmer-dashboard');

        } else {

          alert(data.message || 'Invalid OTP');

        }

      } catch (error) {

        console.error(error);
        alert('Backend server se connection nahi ho raha.');

      }

    });

  }


  // Start Farmer OTP Login
  setupFarmerOtpLogin();



  // ============================================================
  // ADMIN LOGIN - MOBILE NUMBER ONLY
  // NO OTP
  // ============================================================

  const adminForm = document.getElementById('form-login-admin');

  if (adminForm) {

    adminForm.addEventListener('submit', (e) => {

      e.preventDefault();

      const mobileInput =
        document.getElementById('admin-mobile-number');

      const mobile =
        mobileInput ? mobileInput.value.trim() : '';


      // -------------------------------
      // MOBILE NUMBER VALIDATION
      // -------------------------------

      if (!/^[6-9][0-9]{9}$/.test(mobile)) {

        alert('Please enter a valid 10-digit mobile number.');
        return;

      }


      // -------------------------------
      // ADMIN LOGIN
      // -------------------------------

      state.currentUser.mobile = mobile;
      state.currentUser.role = 'admin';
      state.currentUser.name = 'Admin';


      alert('Admin Login Successful!');


      // -------------------------------
      // DIRECT ADMIN DASHBOARD
      // -------------------------------

      navigate('admin-dashboard');

    });

  }
}

const registerForm = document.getElementById('form-register');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert(state.lang === 'hi' ? 'पंजीकरण सफल! आपका खाता बन गया है।' : 'Registration successful! Account created.');
    navigate('farmer-dashboard');
  });
}

const confirmBookingBtn = document.getElementById('btn-confirm-booking');
if (confirmBookingBtn) {
  confirmBookingBtn.addEventListener('click', () => {
    state.currentUser.slotTime = state.selectedSlot;
    state.currentUser.date = document.querySelector('#view-book-slot input[type="date"]').value;
    const mandiSelect = document.getElementById('booking-mandi-select');
    if (mandiSelect) {
      state.currentUser.center = mandiSelect.options[mandiSelect.selectedIndex].text;
    }
    alert(state.lang === 'hi'
      ? `स्लॉट बुकिंग सफल! टोकन: #1024 (${state.selectedSlot})`
      : `Booking Confirmed! Token: #1024 for ${state.selectedSlot}`);
    navigate('qr-pass');
  });
}
function setupSlotSelection() {
  const slotCards = document.querySelectorAll('.slot-time-item');
  slotCards.forEach(card => {
    card.addEventListener('click', () => {
      slotCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedSlot = card.getAttribute('data-time') || '10:00 AM - 11:00 AM';
    });
  });
}

// ==========================================================================
// LIVE QUEUE SIMULATION
// ==========================================================================
function setupQueueTicker() {
  setInterval(() => {
    if (state.currentUser.queuePos > 1) {
      if (Math.random() > 0.6) {
        state.currentUser.queuePos = Math.max(1, state.currentUser.queuePos - 1);
        state.currentUser.estimatedWait = Math.max(2, state.currentUser.queuePos * 2);
        updateQueueDisplay();
      }
    }
  }, 12000);
}

function updateQueueDisplay() {
  document.querySelectorAll('.dynamic-queue-pos').forEach(el => el.textContent = state.currentUser.queuePos);
  document.querySelectorAll('.dynamic-queue-wait').forEach(el => el.textContent = `${state.currentUser.estimatedWait} mins`);

  const progressBar = document.querySelector('.queue-track-fill');
  if (progressBar) {
    const progressPercent = Math.min(100, Math.round(((45 - state.currentUser.queuePos) / 45) * 100));
    progressBar.style.width = `${progressPercent}%`;
  }
}

// ==========================================================================
// AI FARMING ASSISTANT
// ==========================================================================
function setupAIChat() {
  const chatInput = document.getElementById('ai-chat-input');
  const chatSendBtn = document.getElementById('ai-chat-send');
  const chatMessages = document.getElementById('ai-chat-messages');

  function sendMessage() {
    if (!chatInput || !chatInput.value.trim()) return;
    const userText = chatInput.value.trim();

    const userMsgDiv = document.createElement('div');
    userMsgDiv.style.cssText = 'display: flex; justify-content: flex-end; margin-bottom: 12px;';
    userMsgDiv.innerHTML = `
      <div style="background: var(--primary); color: white; padding: 8px 14px; border-radius: 12px 12px 0 12px; font-size: 13px; max-width: 80%;">
        ${userText}
      </div>
    `;
    chatMessages.appendChild(userMsgDiv);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      let botReply = state.lang === 'hi'
        ? "मैं आपकी मंडी स्लॉट बुकिंग, लाइव कतार, MSP भाव या QR पास डाउनलोड में मदद कर सकता हूँ।"
        : "I can help you check mandi rates, download your QR pass, or reschedule your procurement slot.";

      const q = userText.toLowerCase();
      if (q.includes('slot') || q.includes('स्लॉट')) {
        botReply = state.lang === 'hi'
          ? "आपका वर्तमान स्लॉट 31 अगस्त 2026, 10:00 AM - 11:00 AM अजमेर मंडी में बुक है।"
          : "Your current slot is booked for 31 Aug 2026, 10:00 AM - 11:00 AM at Azamgarh Center.";
      } else if (q.includes('queue') || q.includes('कतार') || q.includes('लाइन')) {
        botReply = state.lang === 'hi'
          ? `आप वर्तमान में कतार में #${state.currentUser.queuePos} स्थान पर हैं। अनुमानित समय ${state.currentUser.estimatedWait} मिनट है।`
          : `You are currently at Position #${state.currentUser.queuePos}. Estimated waiting time is ${state.currentUser.estimatedWait} mins.`;
      } else if (q.includes('document') || q.includes('कागजात')) {
        botReply = state.lang === 'hi'
          ? "आवश्यक दस्तावेज: आधार कार्ड, खतौनी/जमीन का पर्चा, बैंक पासबुक और किसान बंधु QR पास।"
          : "Required documents: Aadhaar Card, Land Record (Khatauni), Bank Passbook, and Kisan Bandhu QR Pass.";
      }

      const botMsgDiv = document.createElement('div');
      botMsgDiv.style.cssText = 'display: flex; gap: 10px; margin-bottom: 12px;';
      botMsgDiv.innerHTML = `
        <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary-subtle); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;">🤖</div>
        <div style="background: var(--input-bg); color: var(--text-dark); padding: 8px 14px; border-radius: 12px 12px 12px 0; font-size: 13px; max-width: 80%; border: 1px solid var(--border-color);">
          ${botReply}
        </div>
      `;
      chatMessages.appendChild(botMsgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
  }

  if (chatSendBtn) chatSendBtn.addEventListener('click', sendMessage);
  if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

  document.querySelectorAll('.ai-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chatInput) {
        chatInput.value = chip.textContent.trim();
        sendMessage();
      }
    });
  });
}

// ==========================================================================
// NOTIFICATIONS & ADMIN
// ==========================================================================
function renderNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  const filtered = state.notificationsFilter === 'all'
    ? state.notifications
    : state.notifications.filter(n => n.type === state.notificationsFilter);

  container.innerHTML = filtered.map(n => `
    <div class="notification-item">
      <div class="notif-icon">${n.type === 'sms' ? '💬' : n.type === 'whatsapp' ? '📱' : '🔔'}</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 14px; color: var(--text-dark); margin-bottom: 2px;">
          ${state.lang === 'hi' ? n.titleHi : n.titleEn}
        </div>
        <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">
          ${state.lang === 'hi' ? n.messageHi : n.messageEn}
        </div>
        <div style="font-size: 11px; color: var(--text-light);">${n.time}</div>
      </div>
    </div>
  `).join('');
}

function filterNotifications(type) {
  state.notificationsFilter = type;
  document.querySelectorAll('.filter-pills button').forEach(btn => {
    if (btn.getAttribute('data-filter') === type) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  renderNotifications();
}


// ==========================================================================
// COMPLETE ADMIN MANAGEMENT PANEL
// Frontend demo data is stored in localStorage. Connect these actions to
// your Java + MySQL APIs later for permanent server-side persistence.
// ==========================================================================

const ADMIN_TODAY = '2026-09-14';

const adminSeed = {
  users: [
    { userId: 'ADM001', name: 'System Admin', contact: 'admin@kisanbandhu.in', role: 'ADMIN', accountStatus: 'ACTIVE', createdAt: '2026-08-01' },
    { userId: 'USR10240', name: 'Priyam Prajapati', contact: '8081052909', role: 'FARMER', accountStatus: 'ACTIVE', createdAt: '2026-08-20' },
    { userId: 'USR10241', name: 'Priyanshu Singh', contact: '9876543210', role: 'FARMER', accountStatus: 'ACTIVE', createdAt: '2026-08-21' }
  ],
  farmers: [
    { fullName: 'Priyam Prajapati', userId: 'USR10240', village: 'Daurala', district: 'Meerut', state: 'Uttar Pradesh', pincode: '250221', alternatePhone: '9876500001', aadhaarHash: 'HASH••••1024', status: 'ACTIVE' },
    { fullName: 'Priyanshu Singh', userId: 'USR10241', village: 'Modinagar', district: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201201', alternatePhone: '9876500002', aadhaarHash: 'HASH••••1025', status: 'ACTIVE' },
    { fullName: 'Mohan Lal', userId: 'USR10242', village: 'Hapur', district: 'Hapur', state: 'Uttar Pradesh', pincode: '245101', alternatePhone: '9876500003', aadhaarHash: 'HASH••••1026', status: 'INACTIVE' }
  ],
  crops: [
    { cropName: 'Wheat', cropCode: 'WHT', status: 'ACTIVE' },
    { cropName: 'Paddy / Rice', cropCode: 'RCE', status: 'ACTIVE' },
    { cropName: 'Mustard', cropCode: 'MST', status: 'ACTIVE' },
    { cropName: 'Maize', cropCode: 'MAZ', status: 'ACTIVE' }
  ],
  centres: [
    { centreCode: 'MRT001', centreName: 'Meerut Central Mandi', address: 'Bypass Road, Meerut', district: 'Meerut', state: 'Uttar Pradesh', capacity: 500, status: 'ACTIVE' },
    { centreCode: 'HPR001', centreName: 'Hapur Grain Market', address: 'Railway Road, Hapur', district: 'Hapur', state: 'Uttar Pradesh', capacity: 400, status: 'ACTIVE' },
    { centreCode: 'GZB001', centreName: 'Ghaziabad APMC Center', address: 'Govindpuram, Ghaziabad', district: 'Ghaziabad', state: 'Uttar Pradesh', capacity: 600, status: 'ACTIVE' }
  ],
  seasons: [
    { seasonName: 'Kharif 2026', startDate: '2026-06-01', endDate: '2026-11-30', status: 'ACTIVE' },
    { seasonName: 'Rabi 2026-27', startDate: '2026-11-01', endDate: '2027-04-30', status: 'UPCOMING' }
  ],
  schedules: [
    { centre: 'Meerut Central Mandi', season: 'Kharif 2026', crop: 'Paddy / Rice', scheduleDate: ADMIN_TODAY, startTime: '09:00', endTime: '10:00', maxCapacity: 150, status: 'OPEN', bookedCapacity: 90, availableCapacity: 60 },
    { centre: 'Meerut Central Mandi', season: 'Kharif 2026', crop: 'Wheat', scheduleDate: ADMIN_TODAY, startTime: '10:00', endTime: '11:00', maxCapacity: 200, status: 'OPEN', bookedCapacity: 145, availableCapacity: 55 },
    { centre: 'Hapur Grain Market', season: 'Kharif 2026', crop: 'Paddy / Rice', scheduleDate: ADMIN_TODAY, startTime: '11:00', endTime: '12:00', maxCapacity: 120, status: 'CLOSED', bookedCapacity: 120, availableCapacity: 0 }
  ],
  bookings: [
    { bookingId: 'BK1001', farmer: 'Priyam Prajapati', schedule: 'MRT001 / 10:00-11:00', quantity: 45, bookingDate: ADMIN_TODAY, bookingStatus: 'CONFIRMED' },
    { bookingId: 'BK1002', farmer: 'Priyanshu Singh', schedule: 'MRT001 / 10:00-11:00', quantity: 30, bookingDate: ADMIN_TODAY, bookingStatus: 'WAITING' },
    { bookingId: 'BK1003', farmer: 'Mohan Lal', schedule: 'HPR001 / 11:00-12:00', quantity: 60, bookingDate: ADMIN_TODAY, bookingStatus: 'PENDING' }
  ],
  waiting: [
    { waitingId: 'WL2001', farmer: 'Priyanshu Singh', schedule: 'MRT001 / 10:00-11:00', quantity: 30, queuePosition: 12, status: 'WAITING' },
    { waitingId: 'WL2002', farmer: 'Mohan Lal', schedule: 'HPR001 / 11:00-12:00', quantity: 60, queuePosition: 13, status: 'WAITING' }
  ],
  procurement: [
    { recordId: 'PR3001', bookingId: 'BK1001', procuredQuantity: 45, procurementStatus: 'COMPLETED', rejectionReason: '', procurementDateTime: '2026-09-14 10:42' },
    { recordId: 'PR3002', bookingId: 'BK1002', procuredQuantity: 0, procurementStatus: 'PENDING', rejectionReason: '', procurementDateTime: '' },
    { recordId: 'PR3003', bookingId: 'BK1003', procuredQuantity: 0, procurementStatus: 'REJECTED', rejectionReason: 'Quality standard not met', procurementDateTime: '2026-09-14 11:25' }
  ],
  payments: [
    { paymentId: 'PAY4001', bookingId: 'BK1001', farmer: 'Priyam Prajapati', amount: 103500, paymentMethod: 'BANK_TRANSFER', transactionId: 'TXN900001', paymentStatus: 'SUCCESS', paymentDate: '2026-09-08' },
    { paymentId: 'PAY4002', bookingId: 'BK1002', farmer: 'Priyanshu Singh', amount: 72000, paymentMethod: 'BANK_TRANSFER', transactionId: '', paymentStatus: 'PENDING', paymentDate: '' },
    { paymentId: 'PAY4003', bookingId: 'BK1003', farmer: 'Mohan Lal', amount: 0, paymentMethod: 'BANK_TRANSFER', transactionId: '', paymentStatus: 'FAILED', paymentDate: '2026-09-08' }
  ],
  notifications: [
    { notificationId: 'NT5001', farmer: 'Priyam Prajapati', booking: 'BK1001', notificationType: 'SLOT_CONFIRMATION', channel: 'SMS', message: 'Your procurement slot is confirmed.', status: 'SENT', sentAt: '2026-09-08 08:30' },
    { notificationId: 'NT5002', farmer: 'Priyanshu Singh', booking: 'BK1002', notificationType: 'QUEUE_UPDATE', channel: 'WHATSAPP', message: 'Your current queue position is 12.', status: 'SENT', sentAt: '2026-09-08 09:45' },
    { notificationId: 'NT5003', farmer: 'Mohan Lal', booking: 'BK1003', notificationType: 'PAYMENT_ALERT', channel: 'SMS', message: 'Payment is awaiting verification.', status: 'FAILED', sentAt: '2026-09-08 12:00' }
  ]
};

function cloneAdminSeed() {
  return JSON.parse(JSON.stringify(adminSeed));
}

let adminStore = {
  users: [],
  farmers: [],
  crops: [],
  centres: [],
  seasons: [],
  schedules: [],
  bookings: [],
  waiting: [],
  procurement: [],
  payments: [],
  notifications: []
};
const API_BASE_URL = "http://localhost:8080/api/v1";

async function loadAdminDataFromAPI() {
  try {
    console.log('Loading admin data from backend...');

    const [
      usersResponse,
      farmersResponse,
      cropsResponse,
      centresResponse,
      seasonsResponse,
      schedulesResponse,
      bookingsResponse,
      waitingResponse,
      procurementResponse,
      paymentsResponse,
      notificationsResponse
    ] = await Promise.all([
      fetch(`${API_BASE_URL}/admin/users`),
      fetch(`${API_BASE_URL}/admin/farmers`),
      fetch(`${API_BASE_URL}/admin/crops`),
      fetch(`${API_BASE_URL}/admin/centres`),
      fetch(`${API_BASE_URL}/admin/seasons`),
      fetch(`${API_BASE_URL}/admin/schedules`),
      fetch(`${API_BASE_URL}/admin/bookings`),
      fetch(`${API_BASE_URL}/admin/waiting`),
      fetch(`${API_BASE_URL}/admin/procurement`),
      fetch(`${API_BASE_URL}/admin/payments`),
      fetch(`${API_BASE_URL}/admin/notifications`)
    ]);

    if (
      !usersResponse.ok ||
      !farmersResponse.ok ||
      !cropsResponse.ok ||
      !centresResponse.ok ||
      !seasonsResponse.ok ||
      !schedulesResponse.ok ||
      !bookingsResponse.ok ||
      !waitingResponse.ok ||
      !procurementResponse.ok ||
      !paymentsResponse.ok ||
      !notificationsResponse.ok
    ) {
      throw new Error('Backend API response failed');
    }

    adminStore.users = await usersResponse.json();
    adminStore.farmers = await farmersResponse.json();
    adminStore.crops = await cropsResponse.json();
    adminStore.centres = await centresResponse.json();
    adminStore.seasons = await seasonsResponse.json();
    adminStore.schedules = await schedulesResponse.json();
    adminStore.bookings = await bookingsResponse.json();
    adminStore.waiting = await waitingResponse.json();
    adminStore.procurement = await procurementResponse.json();
    adminStore.payments = await paymentsResponse.json();
    adminStore.notifications = await notificationsResponse.json();

    console.log('Admin data loaded successfully:', adminStore);

    renderAdminDashboard();

    Object.keys(adminConfigs).forEach(key => {
      renderAdminModule(key);
    });

  } catch (error) {
    console.error('Admin API Error:', error);

    showAdminApiError();
  }
}
function showAdminApiError() {
  const metricMount = document.getElementById('admin-dashboard-metrics');

  if (metricMount) {
    metricMount.innerHTML = `
      <div class="admin-api-error">
        ⚠️
        <strong>Backend not connected</strong>
        <span>Admin data will appear after Java API is connected.</span>
      </div>
    `;
  }

  const todayMount = document.getElementById('admin-today-schedules');

  if (todayMount) {
    todayMount.innerHTML = `
      <div class="admin-empty">
        Backend API not connected.
      </div>
    `;
  }

  const paymentMount = document.getElementById('admin-payment-summary');

  if (paymentMount) {
    paymentMount.innerHTML = `
      <div class="admin-empty">
        Backend API not connected.
      </div>
    `;
  }

  const statusMount = document.getElementById('admin-status-summary');

  if (statusMount) {
    statusMount.innerHTML = `
      <div class="admin-empty">
        Backend API not connected.
      </div>
    `;
  }
}

function saveAdminStore() {
  localStorage.setItem('kb_admin_store', JSON.stringify(adminStore));
}

function adminEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const adminConfigs = {
  users: {
    title: 'Users & Roles',
    icon: '👥',
    add: 'Add User',
    fields: [
      ['userId', 'User ID', 'text', true],
      ['name', 'Name', 'text'],
      ['contact', 'Phone / Email', 'text'],
      ['role', 'Role', 'select', false, ['ADMIN', 'FARMER']],
      ['accountStatus', 'Account Status', 'select', false, ['ACTIVE', 'INACTIVE']],
      ['createdAt', 'Created At', 'date']
    ],
    columns: [['userId', 'User ID'], ['name', 'Name'], ['contact', 'Phone / Email'], ['role', 'Role'], ['accountStatus', 'Status'], ['createdAt', 'Created At']],
    actions: ['view', 'edit', 'toggle']
  },
  farmers: {
    title: 'Farmers Management',
    icon: '👨‍🌾',
    add: 'Add Farmer',
    fields: [
      ['fullName', 'Full Name', 'text'],
      ['userId', 'User ID', 'text'],
      ['village', 'Village', 'text'],
      ['district', 'District', 'text'],
      ['state', 'State', 'text'],
      ['pincode', 'Pincode', 'text'],
      ['alternatePhone', 'Alternate Phone', 'tel'],
      ['aadhaarHash', 'Aadhaar Hash', 'text'],
      ['status', 'Status', 'select', false, ['ACTIVE', 'INACTIVE']]
    ],
    columns: [['fullName', 'Full Name'], ['userId', 'User ID'], ['village', 'Village'], ['district', 'District'], ['state', 'State'], ['pincode', 'Pincode'], ['alternatePhone', 'Alternate Phone'], ['aadhaarHash', 'Aadhaar Hash'], ['status', 'Status']],
    actions: ['view', 'edit', 'toggle']
  },
  crops: {
    title: 'Crops Management',
    icon: '🌾',
    add: 'Add Crop',
    fields: [
      ['cropName', 'Crop Name', 'text'],
      ['cropCode', 'Crop Code', 'text'],
      ['status', 'Status', 'select', false, ['ACTIVE', 'INACTIVE']]
    ],
    columns: [['cropName', 'Crop Name'], ['cropCode', 'Crop Code'], ['status', 'Status']],
    actions: ['view', 'edit', 'delete']
  },
  centres: {
    title: 'Procurement Centres',
    icon: '🏢',
    add: 'Add Centre',
    fields: [
      ['centreCode', 'Centre Code', 'text'],
      ['centreName', 'Centre Name', 'text'],
      ['address', 'Address', 'text'],
      ['district', 'District', 'text'],
      ['state', 'State', 'text'],
      ['capacity', 'Capacity (Quintal)', 'number'],
      ['status', 'Status', 'select', false, ['ACTIVE', 'INACTIVE']]
    ],
    columns: [['centreCode', 'Centre Code'], ['centreName', 'Centre Name'], ['address', 'Address'], ['district', 'District'], ['state', 'State'], ['capacity', 'Capacity'], ['status', 'Status']],
    actions: ['view', 'edit', 'toggle']
  },
  seasons: {
    title: 'Procurement Seasons',
    icon: '🗓️',
    add: 'Add Season',
    fields: [
      ['seasonName', 'Season Name', 'text'],
      ['startDate', 'Start Date', 'date'],
      ['endDate', 'End Date', 'date'],
      ['status', 'Status', 'select', false, ['UPCOMING', 'ACTIVE', 'CLOSED']]
    ],
    columns: [['seasonName', 'Season Name'], ['startDate', 'Start Date'], ['endDate', 'End Date'], ['status', 'Status']],
    actions: ['view', 'edit', 'delete']
  },
  schedules: {
    title: 'Procurement Schedule',
    icon: '📋',
    add: 'Create Schedule',
    fields: [
      ['centre', 'Procurement Centre', 'text'],
      ['season', 'Season', 'text'],
      ['crop', 'Crop', 'text'],
      ['scheduleDate', 'Schedule Date', 'date'],
      ['startTime', 'Start Time', 'time'],
      ['endTime', 'End Time', 'time'],
      ['maxCapacity', 'Maximum Capacity (Quintal)', 'number'],
      ['status', 'Status', 'select', false, ['OPEN', 'CLOSED', 'CANCELLED']],
      ['bookedCapacity', 'Booked Capacity (read-only)', 'number', true],
      ['availableCapacity', 'Available Capacity (read-only)', 'number', true]
    ],
    columns: [['centre', 'Centre'], ['season', 'Season'], ['crop', 'Crop'], ['scheduleDate', 'Date'], ['startTime', 'Start'], ['endTime', 'End'], ['maxCapacity', 'Max Qtl'], ['status', 'Status'], ['bookedCapacity', 'Booked'], ['availableCapacity', 'Available']],
    actions: ['view', 'edit']
  },
  bookings: {
    title: 'Bookings',
    icon: '🎫',
    add: 'Add Booking',
    fields: [
      ['bookingId', 'Booking ID', 'text'],
      ['farmer', 'Farmer', 'text'],
      ['schedule', 'Schedule', 'text'],
      ['quantity', 'Quantity (Quintal)', 'number'],
      ['bookingDate', 'Booking Date', 'date'],
      ['bookingStatus', 'Booking Status', 'select', false, ['PENDING', 'CONFIRMED', 'WAITING', 'COMPLETED', 'REJECTED', 'CANCELLED']]
    ],
    columns: [['bookingId', 'Booking ID'], ['farmer', 'Farmer'], ['schedule', 'Schedule'], ['quantity', 'Qtl'], ['bookingDate', 'Booking Date'], ['bookingStatus', 'Status']],
    actions: ['view', 'edit']
  },
  waiting: {
    title: 'Waiting List',
    icon: '⏳',
    add: 'Add Waiting Entry',
    fields: [
      ['waitingId', 'Waiting ID', 'text'],
      ['farmer', 'Farmer', 'text'],
      ['schedule', 'Schedule', 'text'],
      ['quantity', 'Quantity (Quintal)', 'number'],
      ['queuePosition', 'Queue Position', 'number'],
      ['status', 'Status', 'select', false, ['WAITING', 'CALLED', 'COMPLETED', 'CANCELLED']]
    ],
    columns: [['waitingId', 'Waiting ID'], ['farmer', 'Farmer'], ['schedule', 'Schedule'], ['quantity', 'Qtl'], ['queuePosition', 'Queue Position'], ['status', 'Status']],
    actions: ['view', 'edit']
  },
  procurement: {
    title: 'Procurement Records',
    icon: '⚖️',
    add: 'Add Record',
    fields: [
      ['recordId', 'Record ID', 'text'],
      ['bookingId', 'Booking ID', 'text'],
      ['procuredQuantity', 'Procured Quantity (Quintal)', 'number'],
      ['procurementStatus', 'Procurement Status', 'select', false, ['PENDING', 'COMPLETED', 'REJECTED']],
      ['rejectionReason', 'Rejection Reason', 'text'],
      ['procurementDateTime', 'Procurement Date / Time', 'datetime-local']
    ],
    columns: [['recordId', 'Record ID'], ['bookingId', 'Booking ID'], ['procuredQuantity', 'Procured Qtl'], ['procurementStatus', 'Status'], ['rejectionReason', 'Rejection Reason'], ['procurementDateTime', 'Procurement Date / Time']],
    actions: ['view', 'edit']
  },
  payments: {
    title: 'Payments',
    icon: '💰',
    add: 'Add Payment',
    fields: [
      ['paymentId', 'Payment ID', 'text'],
      ['bookingId', 'Booking ID', 'text'],
      ['farmer', 'Farmer', 'text'],
      ['amount', 'Amount', 'number'],
      ['paymentMethod', 'Payment Method', 'select', false, ['BANK_TRANSFER', 'UPI', 'CASH']],
      ['transactionId', 'Transaction ID', 'text'],
      ['paymentStatus', 'Payment Status', 'select', false, ['PENDING', 'SUCCESS', 'FAILED']],
      ['paymentDate', 'Payment Date', 'date']
    ],
    columns: [['paymentId', 'Payment ID'], ['bookingId', 'Booking ID'], ['farmer', 'Farmer'], ['amount', 'Amount'], ['paymentMethod', 'Method'], ['transactionId', 'Transaction ID'], ['paymentStatus', 'Status'], ['paymentDate', 'Payment Date']],
    actions: ['view', 'edit', 'check-payment']
  },
  notifications: {
    title: 'Notifications',
    icon: '🔔',
    add: 'Create Notification',
    fields: [
      ['notificationId', 'Notification ID', 'text'],
      ['farmer', 'Farmer', 'text'],
      ['booking', 'Booking', 'text'],
      ['notificationType', 'Notification Type', 'select', false, ['SLOT_CONFIRMATION', 'QUEUE_UPDATE', 'PAYMENT_ALERT', 'GENERAL']],
      ['channel', 'Channel', 'select', false, ['SMS', 'WHATSAPP', 'SYSTEM']],
      ['message', 'Message', 'textarea'],
      ['status', 'Status', 'select', false, ['PENDING', 'SENT', 'FAILED']],
      ['sentAt', 'Sent At', 'datetime-local']
    ],
    columns: [['notificationId', 'Notification ID'], ['farmer', 'Farmer'], ['booking', 'Booking'], ['notificationType', 'Type'], ['channel', 'Channel'], ['message', 'Message'], ['status', 'Status'], ['sentAt', 'Sent At']],
    actions: ['view', 'edit', 'send-retry']
  }
};

function adminStatusBadge(value) {
  const v = String(value ?? '').toUpperCase();
  let cls = 'admin-status-neutral';
  if (['ACTIVE', 'OPEN', 'CONFIRMED', 'COMPLETED', 'SUCCESS', 'SENT', 'CALLED'].includes(v)) cls = 'admin-status-success';
  if (['PENDING', 'WAITING', 'UPCOMING'].includes(v)) cls = 'admin-status-warning';
  if (['INACTIVE', 'CLOSED', 'FAILED', 'REJECTED', 'CANCELLED'].includes(v)) cls = 'admin-status-danger';
  return `<span class="admin-status-badge ${cls}">${adminEscape(value || '-')}</span>`;
}

function formatAdminValue(key, value) {
  if (value === undefined || value === null || value === '') return '-';
  if (['status', 'accountStatus', 'bookingStatus', 'procurementStatus', 'paymentStatus'].includes(key)) {
    return adminStatusBadge(value);
  }
  if (key === 'amount') return '₹' + Number(value).toLocaleString('en-IN');
  return adminEscape(value);
}

function renderAdminModule(key, query = '') {
  const cfg = adminConfigs[key];
  const mount = document.getElementById(`admin-module-${key}`);
  if (!cfg || !mount) return;

  const q = query.trim().toLowerCase();
  const rows = (adminStore[key] || []).filter(row => {
    if (!q) return true;
    return cfg.columns.some(([field]) => String(row[field] ?? '').toLowerCase().includes(q));
  });

  mount.innerHTML = `
    <div class="admin-page-head">
      <div>
        <span class="admin-kicker">${cfg.icon} ADMIN MODULE</span>
        <h2>${cfg.title}</h2>
        <p>Manage ${cfg.title.toLowerCase()} and keep procurement operations updated.</p>
      </div>
      <button class="btn-primary" data-admin-action="open-add" data-module="${key}">＋ ${cfg.add}</button>
    </div>

    <div class="admin-toolbar card">
      <div class="admin-toolbar-left">
        <input class="form-control admin-search" data-admin-search="${key}" value="${adminEscape(query)}"
          placeholder="🔎 Search ${cfg.title.toLowerCase()}...">
        <span class="admin-record-count">${rows.length} record${rows.length === 1 ? '' : 's'}</span>
      </div>
      <button class="btn-secondary" data-admin-action="refresh-module" data-module="${key}">↻ Refresh</button>
    </div>

    <div class="card admin-table-card">
      <div class="table-responsive">
        <table class="custom-table admin-table">
          <thead>
            <tr>${cfg.columns.map(([, label]) => `<th>${adminEscape(label)}</th>`).join('')}<th>Actions</th></tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map((row) => {
    const realIndex = adminStore[key].indexOf(row);
    return `<tr>
                ${cfg.columns.map(([field]) => `<td>${formatAdminValue(field, row[field])}</td>`).join('')}
                <td class="admin-actions">${adminActionButtons(key, realIndex, cfg.actions)}</td>
              </tr>`;
  }).join('') : `<tr><td colspan="${cfg.columns.length + 1}" class="admin-empty">No records found.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const input = mount.querySelector('.admin-search');
  if (input && !input.dataset.bound) {
    input.dataset.bound = '1';
    input.addEventListener('input', () => renderAdminModule(key, input.value));
  }
}

function adminActionButtons(module, index, actions) {
  return actions.map(action => {
    if (action === 'view') return `<button class="admin-action-btn" data-admin-action="view" data-module="${module}" data-index="${index}" title="View">👁️ View</button>`;
    if (action === 'edit') return `<button class="admin-action-btn" data-admin-action="edit" data-module="${module}" data-index="${index}" title="Edit">✏️ Edit</button>`;
    if (action === 'delete') return `<button class="admin-action-btn danger" data-admin-action="delete" data-module="${module}" data-index="${index}" title="Delete">🗑️ Delete</button>`;
    if (action === 'toggle') return `<button class="admin-action-btn" data-admin-action="toggle" data-module="${module}" data-index="${index}">⏻ Toggle</button>`;
    if (action === 'check-payment') return `<button class="admin-action-btn" data-admin-action="check-payment" data-module="${module}" data-index="${index}">🔍 Check</button>`;
    if (action === 'send-retry') return `<button class="admin-action-btn" data-admin-action="send-retry" data-module="${module}" data-index="${index}">📤 Send/Retry</button>`;
    return '';
  }).join('');
}

function openAdminModal(module, index = -1) {
  const cfg = adminConfigs[module];
  const modal = document.getElementById('admin-modal');
  const fields = document.getElementById('admin-modal-fields');
  const title = document.getElementById('admin-modal-title');
  if (!cfg || !modal || !fields) return;

  const existing = index >= 0 ? adminStore[module][index] : (module === 'schedules' ? { bookedCapacity: 0, availableCapacity: 0 } : {});
  title.textContent = index >= 0 ? `Edit ${cfg.title}` : cfg.add;

  fields.innerHTML = cfg.fields.map(([key, label, type, readonly, options]) => {
    const value = existing[key] ?? '';
    if (type === 'select') {
      return `<div class="form-group">
        <label class="form-label">${adminEscape(label)}</label>
        <select class="form-control" name="${key}" ${readonly ? 'disabled' : ''} required>
          ${options.map(option => `<option value="${adminEscape(option)}" ${String(value) === option ? 'selected' : ''}>${adminEscape(option)}</option>`).join('')}
        </select>
      </div>`;
    }
    if (type === 'textarea') {
      return `<div class="form-group admin-field-wide">
        <label class="form-label">${adminEscape(label)}</label>
        <textarea class="form-control" name="${key}" rows="3" ${readonly ? 'readonly' : ''} required>${adminEscape(value)}</textarea>
      </div>`;
    }
    return `<div class="form-group">
      <label class="form-label">${adminEscape(label)}</label>
      <input class="form-control" type="${type}" name="${key}" value="${adminEscape(value)}" ${readonly ? 'readonly' : ''} required>
    </div>`;
  }).join('');

  modal.dataset.module = module;
  modal.dataset.index = String(index);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeAdminModal() {
  const modal = document.getElementById('admin-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

function prepareAdminRecord(module, formData, oldRecord = {}) {
  const record = { ...oldRecord };
  adminConfigs[module].fields.forEach(([key, , type, readonly]) => {
    if (readonly && oldRecord[key] !== undefined) return;
    let value = formData.get(key);
    if (type === 'number') value = value === '' ? 0 : Number(value);
    record[key] = value;
  });

  if (module === 'schedules') {
    record.bookedCapacity = Number(oldRecord.bookedCapacity || 0);
    record.availableCapacity = Math.max(0, Number(record.maxCapacity || 0) - record.bookedCapacity);
  }

  return record;
}

function handleAdminFormSubmit(event) {
  event.preventDefault();
  const modal = document.getElementById('admin-modal');
  if (!modal) return;
  const module = modal.dataset.module;
  const index = Number(modal.dataset.index);
  const cfg = adminConfigs[module];
  if (!cfg) return;

  const oldRecord = index >= 0 ? adminStore[module][index] : {};
  const record = prepareAdminRecord(module, new FormData(event.target), oldRecord);

  if (module === 'schedules') {
    record.bookedCapacity = Math.min(Number(record.bookedCapacity || 0), Number(record.maxCapacity || 0));
    record.availableCapacity = Math.max(0, Number(record.maxCapacity || 0) - record.bookedCapacity);
  }

  if (index >= 0) adminStore[module][index] = record;
  else adminStore[module].push(record);

  saveAdminStore();
  closeAdminModal();
  renderAdminModule(module);
  refreshAdminDashboard();
  alert(index >= 0 ? 'Record updated successfully.' : 'Record added successfully.');
}

function viewAdminRecord(module, index) {
  const row = adminStore[module]?.[index];
  const cfg = adminConfigs[module];
  if (!row || !cfg) return;

  const details = cfg.columns
    .map(([field, label]) => `${label}: ${row[field] ?? '-'}`)
    .join('\n');

  alert(`${cfg.title}\n\n${details}`);
}

function toggleAdminRecord(module, index) {
  const row = adminStore[module][index];
  if (!row) return;
  const field = module === 'users' ? 'accountStatus' : 'status';
  if (!(field in row)) return;
  row[field] = String(row[field]).toUpperCase() === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  saveAdminStore();
  renderAdminModule(module);
  refreshAdminDashboard();
}

function deleteAdminRecord(module, index) {
  if (!adminStore[module][index]) return;
  if (!confirm('Delete this record? This demo action cannot be undone.')) return;
  adminStore[module].splice(index, 1);
  saveAdminStore();
  renderAdminModule(module);
  refreshAdminDashboard();
}

function checkPayment(index) {
  const payment = adminStore.payments[index];
  if (!payment) return;
  if (payment.paymentStatus === 'PENDING') {
    payment.paymentStatus = 'SUCCESS';
    payment.transactionId = payment.transactionId || `TXN${Date.now().toString().slice(-8)}`;
    payment.paymentDate = ADMIN_TODAY;
    saveAdminStore();
    renderAdminModule('payments');
    refreshAdminDashboard();
    alert('Payment status checked: SUCCESS.');
  } else {
    alert(`Payment status: ${payment.paymentStatus}`);
  }
}

function sendOrRetryNotification(index) {
  const notification = adminStore.notifications[index];
  if (!notification) return;
  notification.status = 'SENT';
  notification.sentAt = notification.sentAt || `${ADMIN_TODAY} 12:30`;
  saveAdminStore();
  renderAdminModule('notifications');
  alert('Notification sent/retried successfully.');
}
function renderAdminDashboard() {
  const farmers = (adminStore && adminStore.farmers) || [];
  const bookings = (adminStore && adminStore.bookings) || [];
  const centres = (adminStore && adminStore.centres) || [];
  const seasons = (adminStore && adminStore.seasons) || [];
  const schedules = (adminStore && adminStore.schedules) || [];
  const waiting = (adminStore && adminStore.waiting) || [];
  const procurement = (adminStore && adminStore.procurement) || [];
  const payments = (adminStore && adminStore.payments) || [];

  const totalProcurement = procurement
    .filter(r => r.procurementStatus === 'COMPLETED')
    .reduce((sum, r) => sum + Number(r.procuredQuantity || 0), 0);

  const successPayments = payments
    .filter(p => p.paymentStatus === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pendingPayments = payments
    .filter(p => p.paymentStatus === 'PENDING')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const today =
    typeof ADMIN_TODAY !== 'undefined'
      ? ADMIN_TODAY
      : new Date().toISOString().slice(0, 10);

  const todaySchedules = schedules.filter(
    s => s.scheduleDate === today
  );

  const metrics = [
    ['Total Farmers', farmers.length, '👨‍🌾'],
    ['Total Bookings', bookings.length, '🎫'],
    ['Procurement Centres', centres.length, '🏢'],
    ['Active Seasons', seasons.filter(s => s.status === 'ACTIVE').length, '🗓️'],
    ["Today's Schedules", todaySchedules.length, '📋'],
    ['Waiting List', waiting.filter(w => w.status === 'WAITING').length, '⏳'],
    ['Total Procurement', totalProcurement.toLocaleString('en-IN') + ' Qtl', '⚖️'],
    ['Payment Summary', '₹' + successPayments.toLocaleString('en-IN'), '💰']
  ];

  // =========================
  // DASHBOARD METRIC CARDS
  // =========================
  const metricMount = document.getElementById('admin-dashboard-metrics');

  if (metricMount) {
    metricMount.innerHTML = metrics.map(item => {
      const label = item[0];
      const value = item[1];
      const icon = item[2];

      return `
        <div class="admin-stat-card">
          <div class="admin-stat-icon">${icon}</div>
          <div>
            <div class="admin-stat-label">${label}</div>
            <div class="admin-stat-value">${value}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================
  // TODAY'S SCHEDULES
  // =========================
  const todayMount = document.getElementById('admin-today-schedules');

  if (todayMount) {
    if (todaySchedules.length) {
      todayMount.innerHTML = todaySchedules.map(s => `
        <div class="admin-mini-row">
          <div>
            <strong>${s.centre || 'Centre'}</strong>
            <span>
              ${s.crop || ''} •
              ${s.startTime || ''} -
              ${s.endTime || ''}
            </span>
          </div>

          <div>
            ${
              typeof adminStatusBadge === 'function'
                ? adminStatusBadge(s.status)
                : `<span>${s.status || 'N/A'}</span>`
            }

            <small>${s.availableCapacity || 0} Qtl free</small>
          </div>
        </div>
      `).join('');
    } else {
      todayMount.innerHTML =
        '<div class="admin-empty">No schedules for today.</div>';
    }
  }

  // =========================
  // PAYMENT SUMMARY
  // =========================
  const paymentMount =
    document.getElementById('admin-payment-summary');

  if (paymentMount) {
    paymentMount.innerHTML = `
      <div class="admin-money-row">
        <span>Successful</span>
        <strong>₹${successPayments.toLocaleString('en-IN')}</strong>
      </div>

      <div class="admin-money-row">
        <span>Pending</span>
        <strong>₹${pendingPayments.toLocaleString('en-IN')}</strong>
      </div>

      <div class="admin-money-row">
        <span>Completed Payments</span>
        <strong>
          ${payments.filter(p => p.paymentStatus === 'SUCCESS').length}
        </strong>
      </div>

      <div class="admin-money-row">
        <span>Failed Payments</span>
        <strong>
          ${payments.filter(p => p.paymentStatus === 'FAILED').length}
        </strong>
      </div>
    `;
  }

  // =========================
  // STATUS SUMMARY
  // =========================
  const statusMount =
    document.getElementById('admin-status-summary');

  if (statusMount) {
    const counts = [
      [
        'Pending',
        procurement.filter(
          r => r.procurementStatus === 'PENDING'
        ).length,
        'warning'
      ],
      [
        'Completed',
        procurement.filter(
          r => r.procurementStatus === 'COMPLETED'
        ).length,
        'success'
      ],
      [
        'Rejected',
        procurement.filter(
          r => r.procurementStatus === 'REJECTED'
        ).length,
        'danger'
      ],
      [
        'Confirmed Bookings',
        bookings.filter(
          b => b.bookingStatus === 'CONFIRMED'
        ).length,
        'success'
      ],
      [
        'Waiting Bookings',
        bookings.filter(
          b => b.bookingStatus === 'WAITING'
        ).length,
        'warning'
      ]
    ];

    statusMount.innerHTML = counts.map(
      ([label, value, tone]) => `
        <div class="admin-status-box ${tone}">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `
    ).join('');
  }
}

function refreshAdminDashboard() {
  renderAdminDashboard();
}

function initAdminPanel() {
  Object.keys(adminConfigs).forEach(key => renderAdminModule(key));
  renderAdminDashboard();

  const form = document.getElementById('admin-record-form');
  if (form && !form.dataset.bound) {
    form.dataset.bound = '1';
    form.addEventListener('submit', handleAdminFormSubmit);
  }

  document.addEventListener('click', event => {
    const actionEl = event.target.closest('[data-admin-action]');
    if (!actionEl) return;

    const action = actionEl.getAttribute('data-admin-action');
    const module = actionEl.getAttribute('data-module');
    const index = Number(actionEl.getAttribute('data-index'));

    if (action === 'open-add') openAdminModal(module, -1);
    if (action === 'view') viewAdminRecord(module, index);
    if (action === 'edit') openAdminModal(module, index);
    if (action === 'delete') deleteAdminRecord(module, index);
    if (action === 'toggle') toggleAdminRecord(module, index);
    if (action === 'check-payment') checkPayment(index);
    if (action === 'send-retry') sendOrRetryNotification(index);
    if (action === 'close-modal') closeAdminModal();
    if (action === 'refresh-module') renderAdminModule(module);
    if (action === 'export') exportAdminReport();
  });
}

function exportAdminReport() {
  const lines = ['KISAN BANDHU ADMIN REPORT', `Generated: ${new Date().toLocaleString('en-IN')}`, ''];
  Object.keys(adminConfigs).forEach(key => {
    lines.push(`=== ${adminConfigs[key].title.toUpperCase()} ===`);
    const columns = adminConfigs[key].columns;
    lines.push(columns.map(([, label]) => label).join(','));
    (adminStore[key] || []).forEach(row => {
      lines.push(columns.map(([field]) => `"${String(row[field] ?? '').replace(/"/g, '""')}"`).join(','));
    });
    lines.push('');
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kisan-bandhu-admin-report.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


// GEO MAP (LEAFLET) INTEGRATION
// ==========================================================================
const mandiLocations = {
  meerut: { name: 'Azamgarh Central Mandi', lat: 28.9845, lng: 77.7064, dist: '4.2 km' },
  hapur: { name: 'Hapur Grain Market', lat: 28.7306, lng: 77.7759, dist: '22.0 km' },
  ghaziabad: { name: 'Ghaziabad APMC Center', lat: 28.6692, lng: 77.4538, dist: '35.5 km' },
  modinagar: { name: 'Modinagar Sub-Center', lat: 28.8357, lng: 77.5817, dist: '18.1 km' }
};

let leafletMapInstance = null;
let mapMarkers = {};

function initMandiMap() {
  const mapContainer = document.getElementById('mandi-map');
  if (!mapContainer || typeof L === 'undefined') return;

  if (!leafletMapInstance) {
    leafletMapInstance = L.map('mandi-map', {
      center: [28.85, 77.62],
      zoom: 10,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(leafletMapInstance);

    const mandiSelect = document.getElementById('booking-mandi-select');

    Object.keys(mandiLocations).forEach(key => {
      const mandi = mandiLocations[key];
      const marker = L.marker([mandi.lat, mandi.lng]).addTo(leafletMapInstance);

      marker.bindPopup(`
        <div style="font-family: inherit;">
          <strong style="color: #155724;">🌾 ${mandi.name}</strong><br>
          <span style="font-size: 11px; color: #64748b;">Distance: ${mandi.dist}</span><br>
          <button style="margin-top: 4px; padding: 4px 8px; background: #155724; color: white; border-radius: 4px; font-size: 11px; font-weight: 600;" onclick="selectMandiFromMap('${key}')">
            Select Mandi
          </button>
        </div>
      `);

      marker.on('click', () => {
        if (mandiSelect) mandiSelect.value = key;
      });

      mapMarkers[key] = marker;
    });

    if (mandiSelect) {
      mandiSelect.addEventListener('change', (e) => {
        selectMandiFromMap(e.target.value);
      });
    }
  }

  setTimeout(() => {
    leafletMapInstance.invalidateSize();
  }, 200);
}

window.selectMandiFromMap = function (key) {
  const mandi = mandiLocations[key];
  const mandiSelect = document.getElementById('booking-mandi-select');
  if (mandiSelect) mandiSelect.value = key;

  if (leafletMapInstance && mandi) {
    leafletMapInstance.setView([mandi.lat, mandi.lng], 12);
    if (mapMarkers[key]) mapMarkers[key].openPopup();
  }
};

// ==========================================================
// KISAN BANDHU
// DYNAMIC STATE → DISTRICT → VILLAGE → PROCUREMENT CENTER
// + CROP CATEGORY → CROP TYPE
// ==========================================================


// ==========================================================
// 1. STATE DROPDOWN
// ==========================================================

const stateSelect = document.getElementById("state-select");
const districtSelect = document.getElementById("district-select");
const villageSelect = document.getElementById("village-select");
const centerSelect = document.getElementById("procurement-center-select");


const indianStates = [

  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",

  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"

];


// Add states to dropdown

if (stateSelect) {

  indianStates.forEach(function (state) {

    const option = document.createElement("option");

    option.value = state;
    option.textContent = state;

    stateSelect.appendChild(option);

  });

}


// ==========================================================
// 2. STATE → DISTRICT
// ==========================================================

if (stateSelect) {

  stateSelect.addEventListener("change", async function () {

    const state = this.value;


    // Reset district

    districtSelect.innerHTML =
      '<option value="">Loading districts...</option>';

    districtSelect.disabled = true;


    // Reset village
    villageSelect.innerHTML =
      '<option value="">First select District</option>';
    villageSelect.disabled = true;

    // Reset procurement center
    centerSelect.innerHTML =
      '<option value="">First select Village</option>';
    centerSelect.disabled = true;


    if (!state) {

      districtSelect.innerHTML =
        '<option value="">First select State</option>';

      return;

    }


    try {

      const response = await fetch(
        `/api/districts?state=${encodeURIComponent(state)}`
      );


      if (!response.ok) {

        throw new Error("District API failed");

      }


      const districts = await response.json();


      districtSelect.innerHTML =
        '<option value="">Select District</option>';


      districts.forEach(function (district) {

        const option = document.createElement("option");

        option.value = district;
        option.textContent = district;

        districtSelect.appendChild(option);

      });


      districtSelect.disabled = false;


    } catch (error) {

      console.error("District Error:", error);


      districtSelect.innerHTML =
        '<option value="">District data unavailable</option>';

      alert(
        "District data load nahi ho pa raha. Backend/API check karein."
      );

    }

  });

}


// ==========================================================
// 3. DISTRICT → VILLAGE
// ==========================================================

if (districtSelect) {

  districtSelect.addEventListener("change", async function () {

    const state = stateSelect.value;
    const district = this.value;

    villageSelect.innerHTML =
      '<option value="">Loading villages...</option>';
    villageSelect.disabled = true;

    centerSelect.innerHTML =
      '<option value="">First select Village</option>';
    centerSelect.disabled = true;

    if (!district) {
      villageSelect.innerHTML =
        '<option value="">First select District</option>';
      return;
    }

    try {

      const response = await fetch(
        `/api/villages?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
      );

      if (!response.ok) {
        throw new Error("Village API failed");
      }

      const villages = await response.json();

      villageSelect.innerHTML =
        '<option value="">Select Village</option>';

      villages.forEach(function (village) {
        const option = document.createElement("option");
        option.value = village;
        option.textContent = village;
        villageSelect.appendChild(option);
      });

      villageSelect.disabled = false;

    } catch (error) {

      console.error("Village Error:", error);

      villageSelect.innerHTML =
        '<option value="">Village data unavailable</option>';

      alert(
        "Village data load nahi ho pa raha. Backend/API check karein."
      );

    }

  });

}


// ==========================================================
// 4. VILLAGE → PROCUREMENT CENTER
// ==========================================================

if (villageSelect) {

  villageSelect.addEventListener("change", async function () {

    const state = stateSelect.value;
    const district = districtSelect.value;
    const village = this.value;


    centerSelect.innerHTML =
      '<option value="">Loading procurement centers...</option>';

    centerSelect.disabled = true;


    if (!village) {

      centerSelect.innerHTML =
        '<option value="">First select Village</option>';

      return;

    }


    try {

      const response = await fetch(
        `/api/procurement-centers?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&village=${encodeURIComponent(village)}`
      );


      if (!response.ok) {

        throw new Error(
          "Procurement center API failed"
        );

      }


      const centers = await response.json();


      centerSelect.innerHTML =
        '<option value="">Select Procurement Center</option>';


      centers.forEach(function (center) {

        const option = document.createElement("option");


        if (typeof center === "object") {

          option.value = center.id || center.name;
          option.textContent = center.name || center.id;

        } else {

          option.value = center;
          option.textContent = center;

        }


        centerSelect.appendChild(option);

      });


      centerSelect.disabled = false;


    } catch (error) {

      console.error(
        "Procurement Center Error:",
        error
      );


      centerSelect.innerHTML =
        '<option value="">Centers unavailable</option>';


      alert(
        "Procurement center data load nahi ho pa raha."
      );

    }

  });

}


// ==========================================================
// 5. CROP CATEGORY → CROP TYPE
// ==========================================================

const cropCategory =
  document.getElementById("crop-category");

const cropType =
  document.getElementById("crop-type");


// ==========================================================
// COMPLETE CROP DATA
// ==========================================================

const cropData = {

  // -------------------------------
  // CEREALS
  // -------------------------------

  Cereals: [

    "Wheat",
    "Rice / Paddy",
    "Maize / Corn",
    "Bajra / Pearl Millet",
    "Jowar / Sorghum",
    "Ragi / Finger Millet",
    "Barley"

  ],


  // -------------------------------
  // PULSES
  // -------------------------------

  Pulses: [

    "Gram / Chickpea",
    "Pigeon Pea / Arhar",
    "Black Gram / Urad",
    "Green Gram / Moong",
    "Lentil / Masoor",
    "Peas"

  ],


  // -------------------------------
  // OILSEEDS
  // -------------------------------

  Oilseeds: [

    "Mustard",
    "Groundnut",
    "Soybean",
    "Sunflower",
    "Sesame / Til"

  ],


  // -------------------------------
  // COMMERCIAL CROPS
  // -------------------------------

  Commercial: [

    "Sugarcane",
    "Cotton",
    "Jute"

  ],


  // -------------------------------
  // VEGETABLES
  // -------------------------------

  Vegetables: [

    "Potato",
    "Tomato",
    "Onion",
    "Garlic",
    "Chilli",
    "Brinjal / Eggplant",
    "Cauliflower",
    "Cabbage",
    "Carrot",
    "Okra / Bhindi",
    "Peanut"

  ],


  // -------------------------------
  // SPICES
  // -------------------------------

  Spices: [

    "Chilli",
    "Turmeric",
    "Ginger"

  ],


  // -------------------------------
  // FRUITS
  // -------------------------------

  Fruits: [

    "Mango",
    "Banana",
    "Apple",
    "Guava",
    "Papaya",
    "Orange",
    "Grapes",
    "Pomegranate"

  ]

};


// ==========================================================
// 6. CROP CATEGORY CHANGE
// ==========================================================

if (cropCategory && cropType) {

  cropCategory.addEventListener(
    "change",
    function () {

      const category = this.value;


      cropType.innerHTML =
        '<option value="">Select Crop</option>';

      cropType.disabled = true;


      if (!category) {

        cropType.innerHTML =
          '<option value="">First select Crop Category</option>';

        return;

      }


      const crops =
        cropData[category] || [];


      crops.forEach(function (crop) {

        const option =
          document.createElement("option");

        option.value = crop;
        option.textContent = crop;

        cropType.appendChild(option);

      });


      cropType.disabled = false;

    }
  );

}

// ==========================================================================
// ANIMATED PHOTO SHOWCASE
// ==========================================================================
let showcaseIndex = 0;
let showcaseTimer = null;

function showcaseRender() {
  const slides = document.querySelectorAll('.showcase-slide');
  const dots = document.querySelectorAll('.showcase-dot');
  if (!slides.length) return;

  slides.forEach((s, i) => s.classList.toggle('active', i === showcaseIndex));
  dots.forEach((d, i) => d.classList.toggle('active', i === showcaseIndex));
}

function showcaseMove(step) {
  const slides = document.querySelectorAll('.showcase-slide');
  if (!slides.length) return;
  showcaseIndex = (showcaseIndex + step + slides.length) % slides.length;
  showcaseRender();
  showcaseResetTimer();
}

function showcaseGoTo(index) {
  showcaseIndex = index;
  showcaseRender();
  showcaseResetTimer();
}

function showcaseResetTimer() {
  clearInterval(showcaseTimer);
  showcaseTimer = setInterval(() => showcaseMove(1), 4500);
}

window.showcaseMove = showcaseMove;
window.showcaseGoTo = showcaseGoTo;

// Start autoplay once page loads
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  applyLanguage(state.lang);
  setupNavigation();
  setupSlotSelection();
  setupAIChat();
  setupQueueTicker();
  renderNotifications();
  initAdminPanel();
  loadAdminDataFromAPI();
  updateQRPassDetails();

  navigate(state.currentView);

  // QR ko page render hone ke baad generate karo
  setTimeout(() => {
    generateQRPass();
  }, 300);

  setTimeout(() => {
    generateQRPass();
  }, 1000);
  if (document.getElementById('photo-showcase')) {
    showcaseRender();
    showcaseResetTimer();
  }
});
async function createBooking(bookingData) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      credentials: "include",

      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP Error: ${response.status}`);
    }

    const result = await response.json();

    console.log("Booking successful:", result);

    alert("Slot booking successful!");

    return result;

  } catch (error) {
    console.error("Booking error:", error);
    alert("Booking failed: " + error.message);
  }
}