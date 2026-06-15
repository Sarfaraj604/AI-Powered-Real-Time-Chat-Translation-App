import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux_toolkit/store'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import SocketEventsBinder from './components/SocketEventsBinder.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter>
    <SocketEventsBinder />
    <App />
    </BrowserRouter>
    </Provider>
  </StrictMode>
);
