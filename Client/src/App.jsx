import { useState } from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
// import Navbar from './components/Navbar'
// import EventDetails from './pages/EventDetails'
// import Login from './pages/Login'
// import Register from './pages/Register'
// import UserDashboard from './pages/UserDashboard'
// import AdminDashboard from './pages/AdminDashboard'
// import PaymentSuccess from './pages/PaymentSuccess'
// import PaymentFailure from './pages/PaymentFailed'

//import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return(
    <>  
    <Home />
    </>
  )
}

export default App
