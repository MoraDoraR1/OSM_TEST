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
const scoresRef = collection(db, "scores");

// 반응속도 기록(ms)과 닉네임을 Firestore에 저장한다.
export async function saveScore(ms, nickname) {
  await addDoc(scoresRef, {
    ms,
    nickname,
    createdAt: serverTimestamp(),
  });
}

// 가장 빠른(작은 ms) 기록 상위 n개를 가져온다.
export async function getTop(n) {
  const q = query(scoresRef, orderBy("ms", "asc"), limit(n));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}
