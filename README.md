# 7.77초 타이밍 게임

클릭하면 0초부터 타이머가 시작되어 ms 단위까지 실시간으로 카운트업됩니다. 목표는 7.77초에
최대한 가깝게 다시 클릭해서 멈추는 것이며, 초록 화면에 걸린 시간과 목표와의 차이, 랭킹(TOP 10,
차이가 작을수록 상위)을 보여주고 닉네임을 입력하면 Firebase에 기록을 저장합니다. 10초가 넘도록
멈추지 않으면 게임 오버 처리 후 처음 화면으로 돌아갑니다.

## 폴더 구조

```
index.html            게임 화면 마크업
css/style.css         상태별(파랑/초록/주황) 스타일
js/game.js            게임 상태 전이 및 목표 시각(7.77초) 근접도 측정 로직
js/firebase.js         DB 접근 함수 saveScore(ms, nickname) / getTop(n) (ms = 목표 시각과의 차이)
js/firebase-config.js  Firebase 프로젝트 설정값 (로컬용 placeholder, 배포 시 Actions secret으로 자동 생성)
firestore.rules        Firestore 보안 규칙
firebase.json / firestore.indexes.json  Firebase CLI 설정
.github/workflows/deploy.yml            GitHub Pages 자동 배포
```

## Firebase 설정 방법

1. https://console.firebase.google.com 에서 새 프로젝트를 생성합니다.
2. 프로젝트 설정 > 일반 > "내 앱"에서 웹 앱(</>)을 추가하고 발급된 설정값을 복사합니다.
3. 저장소 Settings > Secrets and variables > Actions에 아래 6개 secret을 등록합니다.
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
     `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
   - `.github/workflows/deploy.yml`이 배포할 때마다 이 secret들로 `js/firebase-config.js`를
     새로 생성하므로, 저장소에 커밋된 `js/firebase-config.js`는 실제 값을 담지 않아도 됩니다.
4. Firebase 콘솔 > Firestore Database에서 데이터베이스를 생성합니다(리전은 임의로 선택 가능).
5. 보안 규칙을 반영합니다. 둘 중 하나를 선택하세요.
   - Firebase CLI 사용: `firebase login` 후 `firebase deploy --only firestore:rules`
   - 콘솔에서 직접: Firestore Database > 규칙 탭에 `firestore.rules` 내용을 붙여넣고 게시
   - 기록은 `target_scores` 컬렉션에 저장됩니다(예전 반응속도 게임의 `scores` 컬렉션과는 분리).
     이미 `scores` 기준으로 규칙을 게시해두셨다면, `target_scores` 규칙이 추가된 최신
     `firestore.rules` 내용으로 다시 게시해야 새 게임의 저장/조회가 동작합니다.

Firebase config 값은 정적 웹앱 특성상 최종 배포 결과물(클라이언트 코드)에는 그대로 노출되지만,
위 보안 규칙이 기록 형식(nickname 길이, ms 범위 등)만 검증하고 수정/삭제는 막아두었으므로
랭킹 오염 위험을 낮췄습니다. secret으로 관리하는 이유는 값 노출 방지가 아니라 저장소 코드에서
프로젝트별 값을 분리해 관리하기 위함입니다.

## GitHub Pages 배포 방법

1. 저장소 Settings > Pages > Build and deployment > Source를 **GitHub Actions**로 설정합니다.
2. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 정적 파일을 빌드 없이
   그대로 GitHub Pages에 배포합니다.
3. 배포 완료 후 Settings > Pages에 표시되는 URL로 접속하면 됩니다.

## 로컬 확인

빌드 과정이 없는 순수 정적 페이지이므로 `index.html`을 정적 서버로 열면 됩니다. 예:

```
npx serve .
```

(단, Firebase 연동을 확인하려면 위 Firebase 설정을 먼저 완료해야 합니다.)
