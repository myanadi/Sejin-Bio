// ============ 앱별 로직 ============

const Apps = {

  // ─── 창 관리 ───
  openWindow(title, bodyHTML, options = {}) {
    const area = document.getElementById('window-area');
    // 기존 창 제거 (동시 하나만)
    area.innerHTML = '';

    const win = document.createElement('div');
    win.className = 'window';
    const w = options.width || 480;
    const h = options.height || 460;
    win.style.width = w + 'px';
    win.style.height = h + 'px';
    win.style.left = (window.innerWidth / 2 - w / 2) + 'px';
    win.style.top = (window.innerHeight / 2 - h / 2 - 20) + 'px';

    win.innerHTML = `
      <div class="window-header">
        <span class="window-title">${title}</span>
        <button class="window-close">✕</button>
      </div>
      <div class="window-body">${bodyHTML}</div>
    `;
    area.appendChild(win);

    win.querySelector('.window-close').addEventListener('click', () => {
      win.remove();
    });

    this.makeDraggable(win);
    return win;
  },

  makeDraggable(win) {
    const header = win.querySelector('.window-header');
    let isDragging = false, startX, startY, startLeft, startTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('window-close')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = win.offsetLeft;
      startTop = win.offsetTop;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      win.style.left = (startLeft + e.clientX - startX) + 'px';
      win.style.top = (startTop + e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', () => { isDragging = false; });
  },

  // ─── 메일함 ───
  openMail() {
    const mails = this.getAllMails();
    let html = '<div class="mail-list">';
    mails.forEach(m => {
      const isRead = State.data.mailRead.includes(m.id);
      html += `
        <div class="mail-item ${isRead ? '' : 'unread'}" data-mail-id="${m.id}">
          <div class="mail-meta">
            <span>${m.from}</span>
            <span>${m.date}</span>
          </div>
          <div class="mail-subject">${m.subject}</div>
        </div>
      `;
    });
    html += '</div>';

    const win = this.openWindow('메일함 · 받은 편지함', html, { width: 480, height: 500 });

    win.querySelectorAll('.mail-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.mailId;
        this.showMailDetail(win, id);
      });
    });
  },

  getAllMails() {
    const result = [...CONTENT.mails];
    // 조건부 메일 추가
    State.data.conditionalMails.forEach(key => {
      if (CONTENT.mailsConditional[key]) {
        result.unshift(CONTENT.mailsConditional[key]);
      }
    });
    return result;
  },

  showMailDetail(win, mailId) {
    const mail = this.getAllMails().find(m => m.id === mailId);
    if (!mail) return;

    if (!State.data.mailRead.includes(mailId)) {
      State.data.mailRead.push(mailId);
      State.save();
    }

    const body = win.querySelector('.window-body');
    body.innerHTML = `
      <div class="mail-detail">
        <button class="mail-back">← 뒤로</button>
        <div class="mail-detail-header">
          <div class="mail-detail-from">발신: ${mail.from} · ${mail.date}</div>
          <div class="mail-detail-subject">${mail.subject}</div>
        </div>
        <div class="mail-detail-body">${this.escapeHtml(mail.body)}</div>
      </div>
    `;
    body.querySelector('.mail-back').addEventListener('click', () => {
      win.remove();
      this.openMail();
    });
  },

  // ─── 사내 공지 ───
  openNotice() {
    let html = '<div class="notice-list">';
    CONTENT.notices.forEach(n => {
      html += `
        <div class="notice-item" data-notice-id="${n.id}">
          <span class="notice-title">[공지] ${n.title}</span>
          <span class="notice-meta">${n.dept}</span>
        </div>
      `;
    });
    html += '</div>';

    const win = this.openWindow('사내 공지', html, { width: 500, height: 400 });

    win.querySelectorAll('.notice-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.noticeId;
        const notice = CONTENT.notices.find(n => n.id === id);
        if (notice) {
          win.querySelector('.window-body').innerHTML = `
            <div class="mail-detail">
              <button class="mail-back">← 뒤로</button>
              <div class="mail-detail-header">
                <div class="mail-detail-from">${notice.dept}</div>
                <div class="mail-detail-subject">${notice.title}</div>
              </div>
              <div class="mail-detail-body">${this.escapeHtml(notice.body)}</div>
            </div>
          `;
          win.querySelector('.mail-back').addEventListener('click', () => {
            win.remove();
            this.openNotice();
          });
        }
      });
    });
  },

  // ─── PLC 심사 ───
  openPLC() {
    const undecided = CONTENT.plcCards.findIndex(c => !State.data.plcDecisions[c.id]);

    if (undecided === -1) {
      // 모두 결정 완료 — 결과 화면
      this.showPLCResult();
      return;
    }

    this.showPLCCard(undecided);
  },

  showPLCCard(index) {
    const card = CONTENT.plcCards[index];
    const total = CONTENT.plcCards.length;

    let dataHTML = '';
    for (const key in card.data) {
      dataHTML += `<div style="display:flex; justify-content:space-between; padding:3px 0;"><span style="color:#8a8a85;">${key}</span><span>${card.data[key]}</span></div>`;
    }

    const readOnly = card.readOnly ? 'disabled' : '';

    const html = `
      <div class="plc-container">
        <div class="plc-progress">${index + 1} / ${total}</div>
        <div class="plc-card">
          <div class="plc-row">
            <span>사번 ${card.id}</span>
            <span>모델 ${card.model}</span>
          </div>
          <div class="plc-row">
            <span>가동 ${card.duration}</span>
            <span>${card.dept}</span>
          </div>
          <div class="plc-section">
            <div class="plc-section-label">[평가 데이터]</div>
            <div class="plc-section-body">${dataHTML}</div>
          </div>
          <div class="plc-section">
            <div class="plc-section-label">[담당자 코멘트]</div>
            <div class="plc-section-body" style="white-space:pre-line;">${card.comment}</div>
          </div>
          <div class="plc-buttons">
            <button class="plc-btn plc-btn-approve" data-decision="approve" ${readOnly}>승인</button>
            <button class="plc-btn plc-btn-hold" data-decision="hold" ${readOnly}>보류</button>
            <button class="plc-btn plc-btn-reject" data-decision="reject" ${readOnly}>거부</button>
          </div>
        </div>
      </div>
    `;

    const win = this.openWindow('PLC 심사 시스템 · 의견서', html, { width: 460, height: 580 });

    win.querySelectorAll('.plc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (card.readOnly) return;
        State.data.plcDecisions[card.id] = btn.dataset.decision;
        State.save();
        Desktop.updateTrash();
        // 다음 카드로
        win.remove();
        this.openPLC();
      });
    });

    if (card.readOnly) {
      // 자동 다음 카드 (확인만)
      const next = win.querySelector('.plc-card');
      const btn = document.createElement('button');
      btn.textContent = '확인';
      btn.className = 'plc-btn';
      btn.style.marginTop = '10px';
      btn.style.width = '100%';
      btn.addEventListener('click', () => {
        State.data.plcDecisions[card.id] = 'readonly';
        State.save();
        Desktop.updateTrash();
        win.remove();
        this.openPLC();
      });
      next.appendChild(btn);
    }
  },

  showPLCResult() {
    const stats = State.plcStats();

    // 누적 효과: 메일 추가
    if (stats.reject >= 5) State.addConditionalMail('rejectMany');
    if (stats.approve >= 7) State.addConditionalMail('approveMany');

    const html = `
      <div class="plc-result">
        <div class="plc-result-title">PLC 의견서 제출 완료</div>
        <div style="max-width:240px; margin:0 auto;">
          <div class="plc-stat"><span>승인</span><span>${stats.approve}명</span></div>
          <div class="plc-stat"><span>보류</span><span>${stats.hold}명</span></div>
          <div class="plc-stat"><span>거부</span><span>${stats.reject}명</span></div>
        </div>
        <div class="plc-result-note">
          귀하의 의견은 PLC 심사부로 송부되었습니다.<br>
          최종 결정은 심사부의 권한입니다.
        </div>
      </div>
    `;

    this.openWindow('PLC 심사 시스템 · 완료', html, { width: 400, height: 360 });
  },

  // ─── 프로젝트 폴더 ───
  openProjects() {
    let html = '<div class="folder-list">';
    CONTENT.projects.forEach(doc => {
      const icon = doc.isFolder ? '📁' : '📄';
      html += `
        <div class="folder-item" data-doc-id="${doc.id}">
          <span class="folder-icon">${icon}</span>
          <span>${doc.name}</span>
        </div>
      `;
    });
    html += '</div>';

    const win = this.openWindow('프로젝트 폴더 · PROJECTS', html, { width: 480, height: 380 });

    win.querySelectorAll('.folder-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.docId;
        const doc = CONTENT.projects.find(d => d.id === id);
        if (doc) this.showDoc(win, doc);
      });
    });
  },

  showDoc(win, doc) {
    win.querySelector('.window-body').innerHTML = `
      <div class="mail-detail">
        <button class="mail-back">← 뒤로</button>
        <div class="mail-detail-header">
          <div class="mail-detail-subject">${doc.name}</div>
        </div>
        <div class="folder-doc">${this.escapeHtml(doc.body).replace(/▓+/g, '<span class="doc-redacted">$&</span>')}</div>
      </div>
    `;
    win.querySelector('.mail-back').addEventListener('click', () => {
      win.remove();
      this.openProjects();
    });
  },

  // ─── 일정표 ───
  openCalendar() {
    let html = '<div class="schedule">';
    html += '<div class="schedule-section-title">이번 주</div>';
    html += '─────────────────────────────────────\n';
    CONTENT.schedule.thisWeek.forEach(s => {
      html += `${s.day}   ${s.time.padEnd(5)} ${s.text}\n`;
    });
    html += '─────────────────────────────────────\n\n';
    html += '<div class="schedule-section-title" style="margin-top:14px;">다음 주 예정</div>';
    html += '─────────────────────────────────────\n';
    CONTENT.schedule.nextWeek.forEach(s => {
      html += `${s.day}   ${s.text}\n`;
    });
    html += '─────────────────────────────────────';
    html += '</div>';

    this.openWindow('일정표', html, { width: 440, height: 440 });
  },

  // ─── 사내 디렉토리 ───
  openDirectory() {
    let html = '';
    html += '<div class="dir-section">';
    html += '<div class="dir-section-title">[R&D 3팀]</div>';
    CONTENT.directory.team.forEach(p => {
      html += `<div class="dir-entry"><span class="dir-name">${p.name}<span class="dir-role">${p.role}</span></span><span class="dir-role">${p.meta}</span></div>`;
    });
    html += '</div>';

    html += '<div class="dir-section">';
    html += '<div class="dir-section-title">[인접 부서]</div>';
    CONTENT.directory.nearby.forEach(d => {
      const restricted = d.restricted ? '<span class="dir-restricted">⚠ 접근 제한</span>' : '';
      html += `<div class="dir-entry"><span>${d.name}</span><span class="dir-role">${d.floor} ${restricted}</span></div>`;
    });
    html += '</div>';

    this.openWindow('사내 디렉토리', html, { width: 460, height: 460 });
  },

  // ─── 휴지통 (터미널 진입) ───
  openTrash() {
    if (!State.trashActive()) {
      this.openWindow('휴지통', '<div style="padding:30px; text-align:center; color:#8a8a85; font-size:12px;">휴지통이 비어 있습니다.<br>(0개 항목)</div>', { width: 320, height: 200 });
      return;
    }

    const html = `
      <div style="padding:20px;">
        <div style="font-size:11px; color:#8a8a85; margin-bottom:14px;">1개 항목 — 복원 가능</div>
        <div class="folder-item" id="trash-log-item">
          <span class="folder-icon">📄</span>
          <span>(제목 없음).log</span>
        </div>
      </div>
    `;

    const win = this.openWindow('휴지통', html, { width: 360, height: 200 });

    win.querySelector('#trash-log-item').addEventListener('click', () => {
      win.remove();
      Terminal.enter();
    });
  },

  // ─── 유틸 ───
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }
};
