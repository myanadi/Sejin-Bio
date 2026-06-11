// ============ 터미널 ============

const Terminal = {
  traceTimer: null,
  traceStart: 0,

  enter() {
    document.getElementById('terminal-screen').style.display = 'flex';
    document.getElementById('desktop').style.display = 'none';

    // 추적 카운터 시작
    this.traceStart = Date.now();
    this.traceTimer = setInterval(() => this.updateTrace(), 1000);
    this.updateTrace();

    // 입력 포커스
    const input = document.getElementById('terminal-input');
    input.value = '';
    input.focus();

    // 입력 이벤트 (한 번만 등록)
    if (!this._initialized) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = input.value.trim();
          if (cmd) this.execute(cmd);
          input.value = '';
        }
      });

      // 모바일용 빠른 명령어
      document.querySelectorAll('#terminal-quick button').forEach(btn => {
        btn.addEventListener('click', () => {
          const cmd = btn.dataset.cmd;
          this.execute(cmd);
        });
      });

      this._initialized = true;
    }

    State.data.terminalEntryCount++;
    State.save();
  },

  updateTrace() {
    const elapsed = Math.floor((Date.now() - this.traceStart) / 1000);
    const min = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const sec = String(elapsed % 60).padStart(2, '0');
    const el = document.getElementById('trace-timer');
    if (el) el.textContent = `${min}:${sec}`;
  },

  print(html, className = '') {
    const body = document.getElementById('terminal-body');
    const div = document.createElement('div');
    div.className = 'terminal-line ' + className;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  },

  printEcho(cmd) {
    this.print(cmd, 'terminal-input-echo');
  },

  execute(rawCmd) {
    const cmd = rawCmd.toLowerCase().trim();
    this.printEcho(rawCmd);

    if (cmd === '/help') return this.cmdHelp();
    if (cmd === '/whoami') return this.cmdWhoami();
    if (cmd === '/query_sub') return this.cmdQuerySub();
    if (cmd === '/msg_recv') return this.cmdMsgRecv();
    if (cmd === '/disconnect') return this.cmdDisconnect();

    // 게시판 번호 입력
    if (/^\d{1,3}$/.test(cmd)) {
      return this.showPost(cmd.padStart(3, '0'));
    }

    this.print('명령어를 인식할 수 없습니다. /help 입력', 'terminal-error');
  },

  cmdHelp() {
    this.print(`[AVAILABLE COMMANDS]
/help        - 명령어 목록
/whoami      - 사용자 정보
/query_SUB   - 잠수구역 정보망 접속
/msg_recv    - 비공식 메시지 수신함
/disconnect  - 정상 모드 복귀

[WARNING] 외부망 접속이 추적되고 있습니다.`, 'terminal-output');
  },

  cmdWhoami() {
    this.print('[ENCRYPTED PERSONAL LOG]', 'terminal-info');
    this.print('사번 SJ-██████ / 비공식 기록', 'terminal-info');
    let html = '';
    CONTENT.diary.forEach(entry => {
      html += `<div class="diary-entry">
        <div class="diary-date">${entry.date}</div>
        <div class="diary-text">${entry.text.replace(/\n/g, '<br>')}</div>
      </div>`;
    });
    html += '<div style="color:#6a6a60; margin-top:10px;">[END OF LOG]</div>';
    this.print(html);
  },

  cmdQuerySub() {
    this.print('[SUB-NET BOARD / 무허가 접속]', 'terminal-info');
    this.print('─────────────────────────────────────', 'terminal-divider');
    let html = '';
    CONTENT.subBoard.forEach(post => {
      if (post.deleted) {
        html += `<div class="terminal-board-row deleted">
          <span class="terminal-board-num">${post.num}</span>
          <span class="terminal-board-title">[삭제됨]</span>
        </div>`;
      } else {
        html += `<div class="terminal-board-row" data-post-num="${post.num}">
          <span class="terminal-board-num">${post.num}</span>
          <span class="terminal-board-title">${post.title}</span>
        </div>`;
      }
    });
    this.print(html);
    this.print('─────────────────────────────────────', 'terminal-divider');
    this.print('번호 입력 또는 행 클릭으로 본문 열람', 'terminal-info');

    // 클릭 이벤트 추가
    document.querySelectorAll('.terminal-board-row[data-post-num]').forEach(row => {
      row.addEventListener('click', () => this.showPost(row.dataset.postNum));
    });
  },

  showPost(num) {
    const post = CONTENT.subBoard.find(p => p.num === num);
    if (!post) {
      this.print(`${num}번 게시글을 찾을 수 없습니다.`, 'terminal-error');
      return;
    }
    if (post.deleted) {
      this.print('이 게시글은 접근할 수 없습니다.', 'terminal-error');
      this.print('[추적 흔적 감지됨]', 'terminal-warn');
      return;
    }
    this.print('─────────────────────────────────────', 'terminal-divider');
    this.print(`NO.${num} / <span class="terminal-post-title">${post.title}</span>`, 'terminal-info');
    this.print('─────────────────────────────────────', 'terminal-divider');
    this.print(post.body.replace(/\n/g, '<br>'));
    this.print('─────────────────────────────────────', 'terminal-divider');
  },

  cmdMsgRecv() {
    this.print('[ENCRYPTED INBOX / MEDX CHANNEL]', 'terminal-info');
    this.print('─────────────────────────────────────', 'terminal-divider');
    let html = '';
    CONTENT.medxMessages.forEach(msg => {
      html += `<div class="msg-row">
        <span class="msg-from">${msg.from}</span>
        <span class="msg-text">${msg.text}</span>
      </div>`;
    });
    this.print(html);
    this.print('─────────────────────────────────────', 'terminal-divider');
  },

  cmdDisconnect() {
    this.print('[SESSION TERMINATED]', 'terminal-info');
    this.print('외부망 접속 종료.', 'terminal-info');
    this.print('정상 모드로 복귀합니다.', 'terminal-info');

    setTimeout(() => {
      this.exit();
    }, 800);
  },

  exit() {
    // 추적 타이머 정리
    if (this.traceTimer) {
      clearInterval(this.traceTimer);
      this.traceTimer = null;
    }

    document.getElementById('terminal-screen').style.display = 'none';
    document.getElementById('desktop').style.display = 'block';

    // 조건부 메일 추가
    State.addConditionalMail('anonymous');
    State.addConditionalMail('securityWarning');
    Desktop.updateMailBadge();

    // 보안 경고 모달
    const modal = document.getElementById('security-modal');
    modal.style.display = 'flex';
    document.getElementById('security-modal-btn').onclick = () => {
      modal.style.display = 'none';
    };
  }
};
