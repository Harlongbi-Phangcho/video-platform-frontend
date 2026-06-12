import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
 // route with react router dom
 import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
      <Toaster 
      position="top-right"
      reverseOrder={false}
      />
    </Router>
  </StrictMode>,
)
