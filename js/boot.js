// ============ 부팅 시퀀스 ============

const BootSequence = {
  logs: [
    '시스템 초기화 중...',
    '[OK] 뉴럴 회선 연결',
    '[OK] 신용 점수 검증',
    '[OK] 출입 권한 확인',
    '[OK] 사내망 동기화'
  ],

  init() {
    const bootScreen = document.getElementById('boot-screen');
    const desktop = document.getElementById('desktop');

    if (State.data.booted) {
      // 이미 부팅 한 적 있으면 바로 데스크탑
      bootScreen.style.display = 'none';
      desktop.style.display = 'block';
      Desktop.init();
      return;
    }

    // 첫 방문 — 풀 부팅 시퀀스
    this.runBootLogs();
  },

  runBootLogs() {
    const logEl = document.getElementById('boot-log');
    logEl.innerHTML = '';

    this.logs.forEach((line, i) => {
      const div = document.createElement('div');
      div.className = 'boot-log-item';
      if (line.startsWith('[OK]')) {
        div.innerHTML = `<span class="boot-log-ok">[OK]</span>${line.substring(4)}`;
      } else {
        div.textContent = line;
      }
      logEl.appendChild(div);

      setTimeout(() => div.classList.add('show'), 300 + i * 400);
    });

    // 로그 끝나면 로그인 화면 표시
    setTimeout(() => {
      document.getElementById('boot-login').style.display = 'block';
      document.getElementById('boot-login-btn').addEventListener('click', () => this.login());
    }, 300 + this.logs.length * 400 + 300);
  },

  login() {
    State.data.booted = true;
    State.save();

    const bootScreen = document.getElementById('boot-screen');
    bootScreen.style.transition = 'opacity 0.4s';
    bootScreen.style.opacity = '0';

    setTimeout(() => {
      bootScreen.style.display = 'none';
      document.getElementById('desktop').style.display = 'block';
      Desktop.init();
    }, 400);
  }
};

document.addEventListener('DOMContentLoaded', () => BootSequence.init());
