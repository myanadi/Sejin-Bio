// ============ 데스크탑 ============

const Desktop = {
  adIndex: 0,
  adTimer: null,

  init() {
    this.bindIcons();
    this.startClock();
    this.startAds();
    this.updateTrash();
    this.updateMailBadge();
    this.updateCreditDrift();
  },

  bindIcons() {
    document.querySelectorAll('.icon').forEach(icon => {
      icon.addEventListener('click', () => {
        const app = icon.dataset.app;
        switch (app) {
          case 'mail': Apps.openMail(); break;
          case 'notice': Apps.openNotice(); break;
          case 'plc': Apps.openPLC(); break;
          case 'projects': Apps.openProjects(); break;
          case 'calendar': Apps.openCalendar(); break;
          case 'directory': Apps.openDirectory(); break;
          case 'trash': Apps.openTrash(); break;
        }
      });
    });

    // 광고 닫기
    document.getElementById('hud-ad-close').addEventListener('click', () => {
      this.nextAd();
    });
  },

  startClock() {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      document.getElementById('hud-time').textContent = `${h}:${m}`;
    };
    update();
    setInterval(update, 30000);
  },

  startAds() {
    this.nextAd();
    // 12초마다 다음 광고
    this.adTimer = setInterval(() => this.nextAd(), 12000);

    // 가끔 글리치 광고
    setInterval(() => {
      if (Math.random() < 0.15) this.glitchAd();
    }, 25000);
  },

  nextAd() {
    const ad = CONTENT.ads[this.adIndex % CONTENT.ads.length];
    this.adIndex++;
    const adEl = document.getElementById('hud-ad');
    adEl.classList.remove('glitch');
    adEl.style.animation = 'none';
    void adEl.offsetWidth;
    adEl.style.animation = 'adFadeIn 0.4s';
    document.getElementById('hud-ad-text').innerHTML = ad.text;
  },

  glitchAd() {
    const adEl = document.getElementById('hud-ad');
    const glitchText = CONTENT.glitchAds[Math.floor(Math.random() * CONTENT.glitchAds.length)];
    const originalText = document.getElementById('hud-ad-text').innerHTML;

    adEl.classList.add('glitch');
    document.getElementById('hud-ad-text').innerHTML = glitchText;

    setTimeout(() => {
      adEl.classList.remove('glitch');
      document.getElementById('hud-ad-text').innerHTML = originalText;
    }, 1800);
  },

  updateTrash() {
    const trashBadge = document.getElementById('trash-badge');
    if (State.trashActive()) {
      trashBadge.style.display = 'flex';
    } else {
      trashBadge.style.display = 'none';
    }
  },

  updateMailBadge() {
    const count = State.data.conditionalMails.length;
    const el = document.getElementById('hud-mail-count');
    if (count > 0) {
      el.textContent = `신규 메일 ${1 + count}`;
    } else {
      el.textContent = '신규 메일 1';
    }
  },

  updateCreditDrift() {
    // 신용 점수 미세 변동 (분위기용)
    setInterval(() => {
      const drift = Math.floor(Math.random() * 5) - 2;
      State.data.creditScore = Math.max(700, Math.min(780, State.data.creditScore + drift));
      document.getElementById('hud-credit').textContent = State.data.creditScore;
    }, 8000);
  }
};
