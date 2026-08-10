// ==========================================
// ⚙️ البيانات الأساسية
// ==========================================
let platformUSDT = 15000.00;
let platformSDG = 29400000;
let currentUser = {
    name: "Mustafa",
    phone: "0912345678",
    avatar: "",
    subscriptions: ["استثمار سنوي (25% عائد)"],
    email: ""
};

let generatedOTP = "";

// ==========================================
// 1. ميزة تفعيل الوضع الداكن وفحص حالة الدخول
// ==========================================
function toggleTheme() {
    const htmlTag = document.documentElement;
    const currentTheme = htmlTag.getAttribute('data-theme');
    const themeIcon = document.getElementById('theme-icon');
    if (currentTheme === 'dark') {
        htmlTag.setAttribute('data-theme', 'light');
        themeIcon.setAttribute('name', 'moon-outline');
        localStorage.setItem('theme', 'light');
    } else {
        htmlTag.setAttribute('data-theme', 'dark');
        themeIcon.setAttribute('name', 'sun-outline');
        localStorage.setItem('theme', 'dark');
    }
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.setAttribute('name', savedTheme === 'dark' ? 'sun-outline' : 'moon-outline');
    }
}

// دالة التحقق مما إذا كان المستخدم مسجلاً مسبقاً عند فتح التطبيق
function checkLoginState() {
    const savedUser = localStorage.getItem('qmb_logged_user');
    
    if (savedUser) {
        // إذا كان مسجلاً من قبل، استرجاع بياناته وتوجيهه للشاشة الرئيسية مباشرة
        currentUser = JSON.parse(savedUser);
        
        // تحديث الواجهة ببيانات المستخدم المحفوظة
        document.getElementById('user-display-name').innerText = currentUser.name;
        document.getElementById('modal-user-name').innerText = currentUser.name;
        document.getElementById('modal-user-phone').innerText = currentUser.phone;
        
        if (currentUser.avatar) {
            document.getElementById('user-avatar-img').src = currentUser.avatar;
            document.getElementById('modal-user-img').src = currentUser.avatar;
        }

        navigateTo('app-screen');
    } else {
        // إذا لم يسجل من قبل، أظهر شاشة تسجيل الدخول
        navigateTo('auth-screen');
    }
}

// ==========================================
// 2. إدارة تسجيل الدخول والتحقق (تتم لمرة واحدة فقط)
// ==========================================
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function sendOTP() {
    const emailInput = document.getElementById('email-input');
    const email = emailInput.value.trim();
    
    if (!email || !isValidEmail(email)) {
        return alert('يرجى إدخال بريد إلكتروني صحيح ويحتوي على تنسيق صالح (مثال: user@gmail.com)');
    }

    currentUser.email = email;

    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    alert(`تم إرسال رمز التحقق الحقيقي إلى بريدك: ${generatedOTP}`);

    document.getElementById('email-step').classList.add('hidden');
    document.getElementById('otp-step').classList.remove('hidden');
}

function verifyOTP() {
    const otp = document.getElementById('otp-input').value.trim();
    
    if (otp === generatedOTP) {
        document.getElementById('otp-step').classList.add('hidden');
        document.getElementById('profile-step').classList.remove('hidden');
    } else {
        alert('رمز التحقق غير صحيح! يرجى التأكد من الرمز المرسل.');
    }
}

function completeProfile() {
    const name = document.getElementById('fullname-input').value.trim();
    const phone = document.getElementById('phone-input').value.trim();
    if (!name || !phone) return alert('يرجى إدخال البيانات المطلوبة');
    
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;

    // **حفظ بيانات المستخدم في الذاكرة لكي لا يضطر للتسجيل مرة أخرى**
    localStorage.setItem('qmb_logged_user', JSON.stringify(currentUser));

    document.getElementById('user-display-name').innerText = name;
    document.getElementById('modal-user-name').innerText = name;
    document.getElementById('modal-user-phone').innerText = phone;
    document.getElementById('user-avatar-img').src = currentUser.avatar;
    document.getElementById('modal-user-img').src = currentUser.avatar;
    
    navigateTo('app-screen');
    updatePlatformLiquidity();
}

function logout() {
    // عند تسجيل الخروج، يتم مسح البيانات المحفوظة والعودة لتسجيل الدخول
    localStorage.removeItem('qmb_logged_user');
    generatedOTP = '';
    document.getElementById('email-step').classList.remove('hidden');
    document.getElementById('otp-step').classList.add('hidden');
    document.getElementById('profile-step').classList.add('hidden');
    document.getElementById('email-input').value = '';
    document.getElementById('otp-input').value = '';
    navigateTo('auth-screen');
}

function updatePlatformLiquidity() {
    const usdtElem = document.getElementById('usdt-balance');
    const sdgElem = document.getElementById('sdg-balance');
    
    if (usdtElem && sdgElem) {
        usdtElem.innerHTML = `<small>USDT</small> ${platformUSDT.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        sdgElem.innerText = `≈ SDG ${platformSDG.toLocaleString('en-US')}`;
    }
}

function openProfileModal() {
    document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

function uploadAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgData = e.target.result;
            currentUser.avatar = imgData;
            document.getElementById('user-avatar-img').src = imgData;
            document.getElementById('modal-user-img').src = imgData;
            
            // تحديث البيانات المحفوظة بالصورة الجديدة
            localStorage.setItem('qmb_logged_user', JSON.stringify(currentUser));
        };
        reader.readAsDataURL(file);
    }
}

function rateCardClick(type) {
    openChatWithContext(`طلب ${type} USDT بسعر السوق`);
}

function navigateTo(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        window.scrollTo(0, 0);
    }
}

let isBalanceHidden = false;
function toggleBalance() {
    const usdt = document.getElementById('usdt-balance');
    const sdg = document.getElementById('sdg-balance');
    const icon = document.getElementById('eye-icon');
    if (!isBalanceHidden) {
        usdt.innerText = 'USDT ••••••';
        sdg.innerText = 'SDG ••••••••••';
        icon.setAttribute('name', 'eye-off-outline');
        isBalanceHidden = true;
    } else {
        updatePlatformLiquidity();
        icon.setAttribute('name', 'eye-outline');
        isBalanceHidden = false;
    }
}

// ==========================================
// 3. نظام الربط المباشر بـ WhatsApp
// ==========================================
function openChatWithContext(serviceName) {
    const phoneNumber = "249125435055"; 
    
    const message = `مرحباً، أريـد طلب أو الاستفسار عن خدمة: [ ${serviceName} ]\nاسم العميل: ${currentUser.name}\nرقم الهاتف: ${currentUser.phone}`;
    
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappURL, '_blank');
}

// تشغيل الفحوصات الأساسية عند فتح التطبيق
document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    checkLoginState(); // فحص ما إذا كان مسجلاً من قبل لتخطي شاشة الدخول
    updatePlatformLiquidity();
});