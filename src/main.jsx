import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import 'antd/dist/reset.css'
import './styles.css'
import { Theme } from './extra/theme'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter theme={Theme}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
