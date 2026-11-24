import { createApp } from "vue";
import "./styles/tokens.css";
import "./styles/base.css";
import App from "./App.vue";
import { initTelegram } from "./utils/telegram";

// Внутри Telegram сообщает клиенту, что страница готова, и раскрывает её
// на весь экран. В обычном браузере ничего не делает.
initTelegram();

createApp(App).mount("#app");
