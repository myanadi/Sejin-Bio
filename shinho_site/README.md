# SHINHO — 세진 사내 단말기 시뮬레이터

신호성 2099 세계관 인터랙티브 체험 사이트.

## 구조

```
shinho_site/
├── index.html          ← 진입점
├── css/
│   ├── desktop.css     ← 데스크탑 UI
│   ├── terminal.css    ← 터미널 UI
│   └── mobile.css      ← 모바일 반응형
├── js/
│   ├── boot.js         ← 부팅 시퀀스
│   ├── state.js        ← localStorage 관리
│   ├── apps.js         ← 메일/공지/PLC 등 앱
│   ├── terminal.js     ← 터미널 명령어
│   └── desktop.js      ← 데스크탑 초기화
└── data/
    └── content.js      ← 모든 텍스트 컨텐츠
```

## 로컬에서 테스트

브라우저로 `index.html` 직접 열어도 작동함. 별도 서버 필요 없음.

```bash
# 또는 간단한 로컬 서버
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```

## GitHub Pages 배포

1. 새 GitHub 저장소 생성 (예: `shinho`)
2. 이 폴더 전체를 푸시
   ```bash
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/(아이디)/shinho.git
   git push -u origin main
   ```
3. 저장소 Settings → Pages → Source를 `main` 브랜치로 설정
4. 몇 분 후 `https://(아이디).github.io/shinho/` 에서 접속 가능

## 기능

### 데스크탑 (PC 화면)
- 부팅 시퀀스 → 로그인 → 데스크탑 진입
- 7개 아이콘: 메일함 / 사내 공지 / PLC 심사 / 프로젝트 / 일정표 / 디렉토리 / 휴지통
- HUD 오버레이: 위치, 시계, 신용 점수(미세 변동), 알림, 광고
- 광고는 12초마다 순환, 가끔 글리치
- 창은 드래그 가능

### 터미널 (숨겨진 층)
- PLC 심사 1명 이상 결정 후 휴지통에 항목 등장
- 휴지통의 (제목 없음).log 클릭 → 터미널 진입
- 명령어: /help /whoami /query_SUB /msg_recv /disconnect
- 게시판 번호 입력 또는 클릭으로 본문 열람
- 우상단 추적 카운터 작동
- /disconnect 또는 닫기 → 보안 경고 모달 + 메일에 보안실 경고 추가

### 진행 저장
- localStorage 사용
- 첫 방문 후 부팅 시퀀스 스킵
- PLC 결정, 읽은 메일, 터미널 진입 흔적 모두 저장

### 모바일 반응형
- 폰에서는 데스크탑 아이콘이 3×3 그리드로
- 창은 풀스크린에 가깝게
- 터미널은 빠른 명령어 버튼 자동 표시

## 초기화 방법

브라우저 콘솔에서:
```js
State.reset(); location.reload();
```

또는 개발자 도구 → Application → localStorage → 해당 도메인 삭제.

## 수정 가이드

### 텍스트 수정
`data/content.js`만 편집하면 됨. 메일, 공지, PLC 카드, 게시글 등 모두 여기.

### 색상·폰트 수정
`css/desktop.css` 상단 또는 `css/terminal.css` 상단.

### 새 앱 추가
1. `index.html`의 `.icons-grid`에 아이콘 추가
2. `js/apps.js`에 `openXXX()` 함수 추가
3. `js/desktop.js`의 `bindIcons()`에 case 추가
