import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// 목표 시각이 7.77초 -> 7.77777초로 바뀌어 이전 target_scores 기록과 호환되지 않으므로
// 새 컬렉션을 사용한다(사실상 랭킹 초기화).
const scoresRef = collection(db, "target_scores_v2");

// 목표 시각(7.77777초)과의 차이(ms)와 닉네임을 Firestore에 저장한다.
export async function saveScore(ms, nickname) {
  await addDoc(scoresRef, {
    ms,
    nickname,
    createdAt: serverTimestamp(),
  });
}

// 목표 시각에 가장 가까운(작은 ms) 기록 상위 n개를 가져온다.
export async function getTop(n) {
  const q = query(scoresRef, orderBy("ms", "asc"), limit(n));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}
