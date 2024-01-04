import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Initial/Login/Login'
import Register from './Initial/Register/Register'
import ForgetPass from './Initial/ForgetPass/ForgetPass'
import Verify from './Initial/Verify/Verify'
import ChangePassword from './Initial/ChangePassword/ChangePassword'
import FrontPage from './Components/FrontPage/FrontPage'
import Profile from './Components/Profile/Profile'
import ProfileEdit from './Components/EditProfile/ProfileEdit'
import OverlayPost from './Components/OverlayPost/OverlayPost'
import Explore from './Components/Explore/Explore'
import Reels from './Components/Reels/Reels'


const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/accounts/register/' element={<Register/>}/>
          <Route path='/accounts/register/verify/' element={<Verify/>}/>
          <Route path='/accounts/password/reset/' element={<ForgetPass/>}/>
          <Route path='/accounts/password/reset/changepassword/' element={<ChangePassword/>}/>
          <Route path='/account/' element={<FrontPage/>}/>
          <Route path='/account/profile/:userName/' element={<Profile/>} />
          <Route path='/account/edit/' element={<ProfileEdit/>} />
          <Route path='/account/explore/' element={<Explore/>} />
          <Route path='/account/reels/' element={<Reels/>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
