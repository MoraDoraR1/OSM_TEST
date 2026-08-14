// Firebase 콘솔 > 프로젝트 설정 > 일반 > "내 앱"(웹)에서 발급받은 값을 아래에 채워 넣으세요.
// 이 값은 클라이언트에 그대로 노출되어도 안전하지만, 반드시 firestore.rules의 보안 규칙과 함께 배포해야 합니다.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
