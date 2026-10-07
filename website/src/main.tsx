import { loadRuntimeConfig } from "./lib/runtime-config";

async function bootstrap() {
  await loadRuntimeConfig();
  await import("./lib/firebase-client");
  await import("./application");
}

void bootstrap();
