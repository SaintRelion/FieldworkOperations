export const isDemo =
  new URLSearchParams(window.location.search).get("workspace") === "demo" ||
  (sessionStorage.getItem("fieldwork-demo") === "true" &&
    !new URLSearchParams(window.location.search).has("workspace"));
if (new URLSearchParams(window.location.search).has("workspace"))
  sessionStorage.setItem("fieldwork-demo", String(isDemo));
export const demoFirebaseConfig = {
  apiKey: "AIzaSyBl73p2I3HZcIXqcxCfGfvCgG9IFCHtfy4",
  authDomain: "c-project-s-demo.firebaseapp.com",
  projectId: "c-project-s-demo",
  storageBucket: "c-project-s-demo.firebasestorage.app",
  messagingSenderId: "253518523330",
  appId: "1:253518523330:web:a04fa58e8f4ed029b4045b",
};
export const demoPhoto = "/demo-capture.svg";
export const demoPersonaKey = "fieldwork-demo-persona";
export function openDemo() {
  window.location.assign("/login?workspace=demo");
}
export function exitDemo() {
  sessionStorage.removeItem(demoPersonaKey);
  window.location.assign("/login?workspace=live");
}

export const demoCoordinates = { lat: 0, lng: 0 };
