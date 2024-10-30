import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { Provider } from "react-redux"
import store from "./app/store.ts"
import { ThemeProvider } from "./constants/ThemeProvider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="redbook-ui-theme">
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
