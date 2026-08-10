// ==========================================
// ⚙️ البيانات الأساسية
// ==========================================
let platformUSDT = 15000.00;
let platformSDG = 29400000;
let currentUser = {
    name: "Mustafa",
    phone: "0912345678",
    avatar: "",
    subscriptions: ["استثمار سنوي (25% عائد)"]
};

// ==========================================
// 1. ميزة تفعيل الوضع الداكن والفاتح
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

// ==========================================
// 2. إدارة تسجيل الدخول والتنقل
// ==========================================
function sendOTP() {
    const email = document.getElementById('email-input').value.trim();
    if (!email) return alert('يرجى إدخال البريد الإلكتروني أولاً');
    alert('تم إرسال رمز التحقق التجريبي: 1234');
    document.getElementById('email-step').classList.add('hidden');
    document.getElementById('otp-step').classList.remove('hidden');
}
function verifyOTP() {
    const otp = document.getElementById('otp-input').value.trim();
    if (otp === '1234') {
        document.getElementById('otp-step').classList.add('hidden');
        document.getElementById('profile-step').classList.remove('hidden');
    } else {
        alert('رمز التحقق غير صحيح! استخدم 1234');
    }
}
function completeProfile() {
    const name = document.getElementById('fullname-input').value.trim();
    const phone = document.getElementById('phone-input').value.trim();
    if (!name || !phone) return alert('يرجى إدخال البيانات المطلوبة');
    currentUser.name = name;
    currentUser.phone = phone;
    document.getElementById('user-display-name').innerText = name;
    document.getElementById('modal-user-name').innerText = name;
    document.getElementById('modal-user-phone').innerText = phone;
    const defaultImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;
    document.getElementById('user-avatar-img').src = defaultImg;
    document.getElementById('modal-user-img').src = defaultImg;
    navigateTo('app-screen');
    updatePlatformLiquidity();
}
function logout() {
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
function openChatWithContext(serviceName) {
    document.getElementById('chat-service-title').innerText = serviceName;
    const chatContainer = document.getElementById('chat-messages');
    chatContainer.innerHTML = '';
    
    // رسالة الترحيب الأولى
    const initMsg = document.createElement('div');
    initMsg.className = 'msg-box admin';
    initMsg.innerText = `مرحباً بك يا ${currentUser.name}! اخترت خدمة [${serviceName}]. يرجى كتابة تفاصيل طلبك للبدء فوراً.`;
    chatContainer.appendChild(initMsg);

    // تحميل المحادثات السابقة إن وجدت
    loadMessagesFromLocalStorage(serviceName);
    
    navigateTo('chat-screen');
}

// ==========================================
// 3. نظام الشات المحلي (حفظ وعرض والرد)
// ==========================================
function sendTextMessage() {
    const input = document.getElementById('chat-input-text');
    const text = input.value.trim();
    if (!text) return;

    // عرض رسالة المستخدم محلياً
    appendMessage(text, 'user');
    saveMessageToLocalStorage(text, 'user');
    input.value = '';

    // محاكاة رد تلقائي من الدعم أو النظام بعد ثانية (لضمان اختبار الردود)
    setTimeout(() => {
        const replyText = `تم استلام طلبك بنجاح: "${text}". جاري المعالجة من قبل الإدارة.`;
        appendMessage(replyText, 'admin');
        saveMessageToLocalStorage(replyText, 'admin');
    }, 1000);
}

function handleKeyPress(e) {
    if (e.key === 'Enter') sendTextMessage();
}

function sendImageMessage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgData = e.target.result;
            const imgHTML = `<span>مرفق صورة الإيصال:</span><br><img src="${imgData}" class="msg-img">`;
            
            appendMessage(imgHTML, 'user');
            saveMessageToLocalStorage(imgHTML, 'user');

            // رد تجريبي عند إرفاق صورة
            setTimeout(() => {
                const replyText = "تم استلام صورة الإيصال بنجاح، سيتم التحقق منها وتأكيد الطلب قريباً.";
                appendMessage(replyText, 'admin');
                saveMessageToLocalStorage(replyText, 'admin');
            }, 1200);
        };
        reader.readAsDataURL(file);
    }
}

function appendMessage(content, sender) {
    const box = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg-box ${sender}`;
    msgDiv.innerHTML = content;
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
}

function saveMessageToLocalStorage(content, sender) {
    const serviceName = document.getElementById('chat-service-title').innerText || 'general';
    let messages = JSON.parse(localStorage.getItem('chat_' + serviceName)) || [];
    messages.push({ content, sender, time: Date.now() });
    localStorage.setItem('chat_' + serviceName, JSON.stringify(messages));
}

function loadMessagesFromLocalStorage(serviceName) {
    let messages = JSON.parse(localStorage.getItem('chat_' + serviceName)) || [];
    messages.forEach(msg => {
        appendMessage(msg.content, msg.sender);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    updatePlatformLiquidity();
});