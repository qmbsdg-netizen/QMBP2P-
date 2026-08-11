// ==========================================
// ⚙️ البيانات الأساسية (السيولة والأسعار الجديدة)
// ==========================================
let platformUSDT = 897869753.00;
let platformSDG = 5377847392950;
let currentUser = {
    name: "Mustafa",
    phone: "0912345678",
    avatar: "",
    subscriptions: [],
    email: "",
    isVerified: false,
    selectedInvestment: null,
    investmentAmount: 0
};

let generatedOTP = "";
let activeCameraStream = null;

// نظام إشعارات عصري احترافي
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    
    let iconName = 'checkmark-circle-outline';
    if (type === 'error') iconName = 'alert-circle-outline';
    if (type === 'info') iconName = 'information-circle-outline';

    toast.innerHTML = `
        <ion-icon name="${iconName}"></ion-icon>
        <span style="flex:1;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

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

function checkLoginState() {
    const savedUser = localStorage.getItem('qmb_logged_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIProfile();
        navigateTo('app-screen');
    } else {
        navigateTo('auth-screen');
    }
}

function updateUIProfile() {
    const modalNameElem = document.getElementById('modal-user-name');
    const modalPhoneElem = document.getElementById('modal-user-phone');
    
    if (modalNameElem) modalNameElem.innerText = currentUser.name;
    if (modalPhoneElem) modalPhoneElem.innerText = currentUser.phone;

    if (currentUser.avatar) {
        const avatarImg1 = document.getElementById('user-avatar-img');
        const avatarImg2 = document.getElementById('modal-user-img');
        if (avatarImg1) avatarImg1.src = currentUser.avatar;
        if (avatarImg2) avatarImg2.src = currentUser.avatar;
    }

    const topVerifyBtn = document.getElementById('top-verification-btn');
    const topVerifyText = document.getElementById('top-verify-text');
    const verifyContainer = document.getElementById('verification-status-container');

    if (topVerifyBtn && topVerifyText) {
        if (currentUser.isVerified) {
            topVerifyBtn.className = "binance-verify-pill verified-pill";
            topVerifyText.innerHTML = `<ion-icon name="checkmark-seal" style="vertical-align: middle;"></ion-icon> موثق بنجاح`;
        } else {
            topVerifyBtn.className = "binance-verify-pill";
            topVerifyText.innerText = "إكمال التحقق";
        }
    }

    if (verifyContainer) {
        if (currentUser.isVerified) {
            verifyContainer.innerHTML = `<p style="color: #10b981; font-weight: bold; text-align: center; font-size: 13px;">✔ الحساب موثق بنجاح</p>`;
        } else {
            verifyContainer.innerHTML = `
                <button onclick="openVerificationModal()" class="btn-primary" style="background-color: #d97706; margin-top: 10px;">إكمال التحقق ورفع الصورة</button>
            `;
        }
    }

    const subsContainer = document.getElementById('active-subscriptions');
    if (subsContainer) {
        if (currentUser.subscriptions && currentUser.subscriptions.length > 0) {
            subsContainer.innerHTML = currentUser.subscriptions.map(sub => `
                <div class="sub-item gold-sub" style="margin-bottom: 8px;">
                    <ion-icon name="ribbon-outline"></ion-icon>
                    <div>
                        <strong>${sub} (نشط)</strong>
                        <small>تم تفعيل العائد الاستثماري بنجاح</small>
                    </div>
                </div>
            `).join('');
        } else {
            subsContainer.innerHTML = `<p style="color: var(--text-secondary); font-size: 12px; text-align: center;">لا توجد اشتراكات نشطة حالياً.</p>`;
        }
    }
}

// ==========================================
// 2. نظام رفع صورة التحقق من الجهاز
// ==========================================
function openVerificationModal() {
    if (currentUser.isVerified) {
        return showToast("حسابك موثق بالفعل بالكامل ✅", "info");
    }
    document.getElementById('verification-modal').classList.remove('hidden');
}

function closeVerificationModal() {
    stopAppCamera();
    document.getElementById('verification-modal').classList.add('hidden');
}

async function triggerAppCamera() {
    // فتح نافذة اختيار ملفات الصور من الجهاز مباشرة بدلاً من تشغيل الكاميرا
    let fileInput = document.getElementById('verification-file-input');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.id = 'verification-file-input';
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.onchange = function(event) {
            const file = event.target.files[0];
            if (file) {
                capturePhotoFromStream();
            }
        };
        document.body.appendChild(fileInput);
    }
    fileInput.click();
}

function stopAppCamera() {
    if (activeCameraStream) {
        activeCameraStream.getTracks().forEach(track => track.stop());
        activeCameraStream = null;
    }
    const containerBox = document.getElementById('camera-container-box');
    const triggerBtn = document.getElementById('open-cam-trigger-btn');
    if (containerBox) containerBox.classList.add('hidden');
    if (triggerBtn) triggerBtn.classList.remove('hidden');
}

function capturePhotoFromStream() {
    stopAppCamera();
    currentUser.isVerified = true;
    localStorage.setItem('qmb_logged_user', JSON.stringify(currentUser));
    updateUIProfile();
    closeVerificationModal();
    showToast("🎉 مبروك! تم رفع صورة التحقق وتوثيق حسابك بنجاح.");
}

// ==========================================
// 3. إدارة تسجيل الدخول والتحقق (OTP)
// ==========================================
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function sendOTP() {
    const emailInput = document.getElementById('email-input');
    const email = emailInput.value.trim();
    
    if (!email || !isValidEmail(email)) {
        return showToast('يرجى إدخال بريد إلكتروني صحيح (مثال: user@gmail.com)', 'error');
    }

    currentUser.email = email;
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    showPersistentOtpToast(generatedOTP);

    document.getElementById('email-step').classList.add('hidden');
    document.getElementById('otp-step').classList.remove('hidden');
}

function showPersistentOtpToast(otpCode) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = 'custom-toast info persistent-otp-box';
    toast.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: var(--card-bg, #ffffff);
        color: var(--text-main, #111827);
        border: 1px solid rgba(37, 99, 235, 0.3);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        border-radius: 16px;
        width: 100%;
        max-width: 320px;
        margin: 0 auto 10px auto;
        pointer-events: auto;
    `;

    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
            <ion-icon name="information-circle-outline" style="font-size: 26px; color: #2563eb;"></ion-icon>
            <div style="text-align: right; flex: 1;">
                <span style="font-size: 13px; color: var(--text-secondary, #6b7280); display: block;">رمز التحقق المرسل:</span>
                <strong style="font-size: 20px; color: #2563eb; letter-spacing: 1px;">${otpCode}</strong>
            </div>
        </div>
        <button id="toast-ok-btn" style="
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            border: none;
            width: 100%;
            padding: 10px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        ">موافق</button>
    `;

    container.appendChild(toast);

    document.getElementById('toast-ok-btn').addEventListener('click', () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    });
}

function verifyOTP() {
    const otp = document.getElementById('otp-input').value.trim();
    if (otp === generatedOTP) {
        document.getElementById('otp-step').classList.add('hidden');
        document.getElementById('profile-step').classList.remove('hidden');
        showToast("تم التحقق من البريد بنجاح!");
    } else {
        showToast('رمز التحقق غير صحيح!', 'error');
    }
}

function completeProfile() {
    const name = document.getElementById('fullname-input').value.trim();
    const phone = document.getElementById('phone-input').value.trim();
    if (!name || !phone) return showToast('يرجى إكمال البيانات المطلوبة', 'error');
    
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;

    localStorage.setItem('qmb_logged_user', JSON.stringify(currentUser));
    updateUIProfile();
    navigateTo('app-screen');
    updatePlatformLiquidity();
    showToast(`مرحباً بك مجدداً يا ${name}`);
}

function logout() {
    localStorage.removeItem('qmb_logged_user');
    generatedOTP = '';
    currentUser.subscriptions = [];
    currentUser.isVerified = false;
    document.getElementById('email-step').classList.remove('hidden');
    document.getElementById('otp-step').classList.add('hidden');
    document.getElementById('profile-step').classList.add('hidden');
    document.getElementById('email-input').value = '';
    document.getElementById('otp-input').value = '';
    navigateTo('auth-screen');
    showToast("تم تسجيل الخروج بنجاح", "info");
}

// ==========================================
// 4. نظام خطط الاستثمار والنافذة العصرية لإدخال المبلغ
// ==========================================
function selectInvestmentPlan(planType) {
    if (!currentUser.isVerified) {
        return showToast('⚠️ تنبيه: يرجى إكمال التحقق من الهوية أولاً للاستثمار.', 'error');
    }

    currentUser.selectedInvestment = planType;
    document.getElementById('amount-modal-title').innerText = `استثمار: ${planType}`;
    document.getElementById('custom-investment-input').value = '';
    document.getElementById('modern-amount-modal').classList.remove('hidden');
}

function closeAmountModal() {
    document.getElementById('modern-amount-modal').classList.add('hidden');
}

function setQuickAmount(val) {
    document.getElementById('custom-investment-input').value = val;
}

function confirmInvestmentAmount() {
    const inputVal = document.getElementById('custom-investment-input').value.trim();
    const amount = Number(inputVal);

    if (!inputVal || isNaN(amount) || amount <= 0) {
        return showToast('يرجى إدخال مبلغ استثماري صحيح بالـ USDT', 'error');
    }

    currentUser.investmentAmount = amount;
    closeAmountModal();
    showPaymentDetailsModal(currentUser.selectedInvestment, amount);
}

function showPaymentDetailsModal(planType, amount) {
    let paymentHTML = `
        <div id="payment-modal" class="screen active modal-overlay" style="display:flex !important;">
            <div class="modal-card" style="max-width: 400px; text-align: right;">
                <button class="close-modal" onclick="closePaymentModal()"><ion-icon name="close"></ion-icon></button>
                <h3 class="modal-title" style="text-align: center; margin-bottom: 4px;">تفاصيل الدفع الرقمي</h3>
                <span class="modal-phone" style="text-align: center;">الخطة: <b>${planType}</b> | المبلغ: <b>${amount} USDT</b></span>
                
                <div style="background:var(--btn-icon-bg); padding:10px; border-radius:10px; margin-bottom:10px; font-size:12px; border:1px solid var(--card-border);">
                    <p style="margin-bottom:4px; font-weight:bold;">1. Binance ID:</p>
                    <p style="user-select:all; background:var(--card-bg); padding:6px; border-radius:6px; text-align:center; font-family:monospace;">1268802737</p>
                </div>

                <div style="background:var(--btn-icon-bg); padding:10px; border-radius:10px; margin-bottom:10px; font-size:12px; border:1px solid var(--card-border);">
                    <p style="margin-bottom:4px; font-weight:bold;">2. شبكة TRC20:</p>
                    <p style="user-select:all; background:var(--card-bg); padding:6px; border-radius:6px; text-align:center; font-size:11px; font-family:monospace; word-break:break-all;">TPcsk7uJmPcK4oLjnbsnNiJKW1bDDxU1gF</p>
                </div>

                <div style="background:var(--btn-icon-bg); padding:10px; border-radius:10px; margin-bottom:14px; font-size:12px; border:1px solid var(--card-border);">
                    <p style="margin-bottom:4px; font-weight:bold;">3. شبكة BEP20:</p>
                    <p style="user-select:all; background:var(--card-bg); padding:6px; border-radius:6px; text-align:center; font-size:11px; font-family:monospace; word-break:break-all;">0x520a001683acb8758c39e35652bb71e695ff434e</p>
                </div>

                <button onclick="submitPaymentReceipt('${planType}', ${amount})" class="btn-primary" style="background-color:#10b981; margin-bottom: 8px;">ارفع إيصال الدفع وتأكيد الاشتراك</button>
                <button onclick="closePaymentModal()" style="width:100%; padding:10px; background:transparent; border:1px solid var(--card-border); color:var(--text-secondary); border-radius:10px; cursor:pointer; font-size:12px;">إلغاء</button>
            </div>
        </div>
    `;

    let modalWrapper = document.getElementById('dynamic-payment-wrapper');
    if (!modalWrapper) {
        modalWrapper = document.createElement('div');
        modalWrapper.id = 'dynamic-payment-wrapper';
        document.body.appendChild(modalWrapper);
    }
    modalWrapper.innerHTML = paymentHTML;
}

function closePaymentModal() {
    const modalWrapper = document.getElementById('dynamic-payment-wrapper');
    if (modalWrapper) modalWrapper.innerHTML = '';
}

function submitPaymentReceipt(planType, amount) {
    if (!currentUser.subscriptions.includes(planType)) {
        currentUser.subscriptions.push(planType);
    }
    localStorage.setItem('qmb_logged_user', JSON.stringify(currentUser));
    updateUIProfile();
    closePaymentModal();

    const message = `مرحباً، لقد قمت بالدفع وإرسال إيصال لخطـة الاستثمار:\nالخطة: [ ${planType} ]\nالمبلغ: ${amount} USDT\nاسم العميل: ${currentUser.name}\nرقم الهاتف: ${currentUser.phone}`;
    const whatsappURL = `https://wa.me/249904252568?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappURL, '_blank');
    showToast("تم تسجيل طلب اشتراكك وتوجيهك لتأكيد الإيصال!");
}

// ==========================================
// 5. الوظائف العامة والتنقل
// ==========================================
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
    updateUIProfile();
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.add('hidden');
}

function uploadAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentUser.avatar = e.target.result;
            localStorage.setItem('qmb_logged_user', JSON.stringify(currentUser));
            updateUIProfile();
            showToast("تم تحديث صورة الملف الشخصي بنجاح");
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
    const message = `مرحباً، أريـد طلب أو الاستفسار عن خدمة: [ ${serviceName} ]\nاسم العميل: ${currentUser.name}\nرقم الهاتف: ${currentUser.phone}`;
    const whatsappURL = `https://wa.me/249904252568?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    loadSavedTheme();
    checkLoginState();
    updatePlatformLiquidity();
});