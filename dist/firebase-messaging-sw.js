importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAUgsWBuHxqq4GUOZjLPaqjGXLI4rrn0fQ",
  authDomain: "lecker-4ec6f.firebaseapp.com",
  projectId: "lecker-4ec6f",
  storageBucket: "lecker-4ec6f.firebasestorage.app",
  messagingSenderId: "967568033913",
  appId: "1:967568033913:web:25598e28e276412478aca8",
});

const messaging = firebase.messaging();

// 🔥 أهم جزء
messaging.onBackgroundMessage(function (payload) {
  console.log("📩 background:", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/favicon.svg",
    }
  );
});