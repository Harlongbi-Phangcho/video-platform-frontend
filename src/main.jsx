import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
 // route with react router dom
 import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { store } from './store/store.js'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
       <Router>
      <App />
      <Toaster 
      position="top-right"
      reverseOrder={false}
      />
    </Router>
    </Provider>
   
  </StrictMode>,
)
