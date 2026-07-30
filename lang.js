/* =========================================================
   اسکریپت مشترک همهٔ صفحات:
   ۱) تغییر زبان (فارسی/فرانسوی)
   ۲) انیمیشن نمایان‌شدن هنگام اسکرول (Scroll Reveal)
   ۳) تنظیمات مشترک تقسیم اوقات روزانه (فقط با ورود ادمین قابل ویرایش)
   ۴) باز/بسته‌شدن گروه‌های منوی کناری (Sidebar Accordion)
========================================================= */

let currentLang = localStorage.getItem('aghasaib_lang') || 'fa';

function applyLangLabels(){
  document.querySelectorAll('[data-fa]').forEach(el=>{
    const val = el.getAttribute('data-' + currentLang);
    if(val !== null) el.textContent = val;
  });
  const btnFa = document.getElementById('lang-fa');
  const btnFr = document.getElementById('lang-fr');
  if(btnFa && btnFr){
    btnFa.classList.toggle('active', currentLang === 'fa');
    btnFr.classList.toggle('active', currentLang === 'fr');
  }
}

function setLang(lang){
  currentLang = lang;
  localStorage.setItem('aghasaib_lang', lang);
  applyLangLabels();
  if(typeof onLangChange === 'function') onLangChange();
}

/* =========================================================
   حالت روز/شب (Day/Night Mode)
   -----------------------------------------------------------------
   ترجیح در localStorage با کلید 'aghasaib_theme' ذخیره می‌شود ('light' یا 'dark').
   پیش‌فرض 'dark' است (همان طرح فضایی تیرهٔ فعلی).
========================================================= */
const THEME_KEY = 'aghasaib_theme';

function applyTheme(theme){
  if(theme === 'light'){
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const label = document.getElementById('theme-toggle-label');
  if(label){
    label.textContent = theme === 'light'
      ? (currentLang === 'fa' ? 'حالت شب' : 'Mode nuit')
      : (currentLang === 'fa' ? 'حالت روز' : 'Mode jour');
  }
}

function toggleTheme(){
  const current = localStorage.getItem(THEME_KEY) || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
}

/* =========================================================
   Scroll Reveal — با IntersectionObserver
========================================================= */
function initScrollReveal(){
  const items = document.querySelectorAll('.reveal, .reveal-stagger');
  if(!items.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.15, rootMargin:'0px 0px -40px 0px'});
  items.forEach(el=> io.observe(el));
}

/* =========================================================
   Sidebar accordion — گروه‌های منوی کناری قابل جمع‌شدن
========================================================= */
function initSidebarAccordion(){
  document.querySelectorAll('.side-group-heading').forEach(heading=>{
    heading.addEventListener('click', ()=>{
      heading.parentElement.classList.toggle('open');
    });
  });
  // گروهی که لینک صفحهٔ جاری در آن است، به‌طور پیش‌فرض باز باشد
  document.querySelectorAll('.side-group').forEach(group=>{
    if(group.querySelector('a.current')) group.classList.add('open');
  });
}

/* =========================================================
   تقسیم اوقات روزانه — دادهٔ پیش‌فرض + کنترل ادمین
   -----------------------------------------------------------------
   نکته برای ادریس: این تنظیمات (ساعت شروع هر بخش و مدت هر بخش)
   پیش‌فرض هستند. تغییر آن‌ها فقط از طریق پنل ادمین در صفحهٔ
   «برنامه» ممکن است و در LocalStorage مرورگر ذخیره می‌شود.
========================================================= */
const SCHEDULE_SETTINGS_KEY = 'aghasaib_schedule_settings';
const DEFAULT_SCHEDULE_SETTINGS = {
  startHour: 8,
  startMinute: 0,
  periodMinutes: 50,
  periodCount: 6,
  gapMinutes: 0
};

function getScheduleSettings(){
  try{
    const raw = localStorage.getItem(SCHEDULE_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {...DEFAULT_SCHEDULE_SETTINGS};
  }catch(e){ return {...DEFAULT_SCHEDULE_SETTINGS}; }
}
function saveScheduleSettings(settings){
  localStorage.setItem(SCHEDULE_SETTINGS_KEY, JSON.stringify(settings));
}
function buildPeriodTimes(settings){
  const periods = [];
  let cursor = settings.startHour*60 + settings.startMinute;
  for(let i=0; i<settings.periodCount; i++){
    const s = cursor;
    const e = cursor + settings.periodMinutes;
    periods.push({start: fmtTime(s), end: fmtTime(e)});
    cursor = e + (settings.gapMinutes || 0);
  }
  return periods;
}
function fmtTime(mins){
  let h = Math.floor(mins/60);
  const m = mins % 60;
  return `${h}:${m.toString().padStart(2,'0')}`;
}

/* =========================================================
   ورود ادمین مشترک (رمز یکسان برای اعلانات و تنظیمات زمان)
========================================================= */
const ADMIN_PASS_KEY = 'aghasaib_admin_pass';
const DEFAULT_ADMIN_PASS = 'aghasaib1404'; /* ---- رمز پیش‌فرض ادمین: در صورت نیاز تغییر بده ---- */

function checkAdminPass(pass){
  const stored = localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_ADMIN_PASS;
  return pass === stored;
}

/* =========================================================
   نقل‌قول‌های فلسفی در پنل تیرهٔ ثابت (تغییر هر ۷ ثانیه)
   این پنل در همهٔ صفحات یکسان است.
========================================================= */
const dpQuotes = [
  {text:"انسان باید در پی حقیقت باشد، نه آسایش.", source:"آغا صایب"},
  {text:"دانش چراغی است که راه را روشن می‌کند.", source:"آغا صایب"},
  {text:"هر که خود را شناخت، جهان را شناخت.", source:"آغا صایب"},
  {text:"زندگی بدون فلسفه، همچون آسمانی بی‌ستاره است.", source:"افلاطون"},
  {text:"آنچه مرا نمی‌کُشد، مرا نیرومندتر می‌سازد.", source:"نیچه"},
  {text:"جهان، اراده و بازنمود است.", source:"شوپنهاور"},
  {text:"وجود، بر ماهیت مقدم است.", source:"سارتر"},
];
let dpIdx = 0;
function showDarkPanelQuote(){
  const el = document.getElementById('dp-quote');
  const src = document.getElementById('dp-quote-source');
  if(!el) return;
  el.style.opacity = 0;
  setTimeout(()=>{
    const q = dpQuotes[dpIdx];
    el.textContent = q.text;
    if(src) src.textContent = '— ' + q.source;
    el.style.opacity = 1;
    dpIdx = (dpIdx+1) % dpQuotes.length;
  }, 400);
}

document.addEventListener('DOMContentLoaded', ()=>{
  initTheme();
  applyLangLabels();
  initScrollReveal();
  initSidebarAccordion();
  showDarkPanelQuote();
  setInterval(showDarkPanelQuote, 7000);
});
