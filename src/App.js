import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Initial/Login/Login'
import Register from './Initial/Register/Register'
import ForgetPass from './Initial/ForgetPass/ForgetPass'
import Verify from './Initial/Verify/Verify'
import ChangePassword from './Initial/ChangePassword/ChangePassword'
import Home from './Home/Home'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/accounts/register/' element={<Register/>}/>
          <Route path='/accounts/register/verify/' element={<Verify/>}/>
          <Route path='/accounts/password/reset/' element={<ForgetPass/>}/>
          <Route path='/accounts/password/reset/changepassword/' element={<ChangePassword/>}/>
          <Route path='/accounts/home/' element={<Home/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
