import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { ThemeService } from './services/ThemeService'
import './styles/main.scss'
import App from './App'

ThemeService.applyTheme(ThemeService.getTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
