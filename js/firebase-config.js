// 배포 시에는 .github/workflows/deploy.yml이 GitHub Actions secret(VITE_FIREBASE_*)으로
// 이 파일을 덮어써서 생성합니다. 아래 값은 로컬 개발/미리보기용 placeholder입니다.
// 로컬에서 직접 확인하려면 Firebase 콘솔 > 프로젝트 설정 > 일반 > "내 앱"(웹) 값을 채워 넣으세요.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
