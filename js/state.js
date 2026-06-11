// ============ 상태 관리 (localStorage) ============

const STATE_KEY = 'sejin_os_state';

const State = {
  data: null,

  defaultState: {
    booted: false,
    creditScore: 742,
    mailRead: [],
    plcDecisions: {},  // { '1A-1102': 'approve' | 'hold' | 'reject' }
    terminalEntered: false,
    terminalEntryCount: 0,
    conditionalMails: []  // ['anonymous', 'securityWarning', 'rejectMany', 'approveMany']
  },

  load() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        this.data = JSON.parse(raw);
        // 누락 필드 보완
        for (const key in this.defaultState) {
          if (!(key in this.data)) this.data[key] = this.defaultState[key];
        }
      } else {
        this.data = { ...this.defaultState };
      }
    } catch (e) {
      this.data = { ...this.defaultState };
    }
    return this.data;
  },

  save() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('localStorage save failed', e);
    }
  },

  reset() {
    this.data = { ...this.defaultState };
    this.save();
  },

  // PLC 결정 통계
  plcStats() {
    const decisions = Object.values(this.data.plcDecisions);
    return {
      approve: decisions.filter(d => d === 'approve').length,
      hold: decisions.filter(d => d === 'hold').length,
      reject: decisions.filter(d => d === 'reject').length,
      total: decisions.length
    };
  },

  // 휴지통 활성화 조건: PLC 결정 1개 이상
  trashActive() {
    return Object.keys(this.data.plcDecisions).length >= 1;
  },

  // 조건부 메일 추가
  addConditionalMail(key) {
    if (!this.data.conditionalMails.includes(key)) {
      this.data.conditionalMails.push(key);
      this.save();
      return true;
    }
    return false;
  }
};

State.load();
