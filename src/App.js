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
import Explore from './Components/Explore/Explore'
import Reels from './Components/Reels/Reels'
import { Toaster } from "react-hot-toast"
import { LoaderProvider, useLoader } from './Others/LoaderContext';


const App = () => {

  return (
    <LoaderProvider>
      <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
        <MainContent />
      </BrowserRouter>
    </LoaderProvider>
  );
};

const MainContent = () => {
  const { isLoading } = useLoader();

  return (
    <div className={`app ${isLoading ? 'blur-background' : ''}`}>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/accounts/register/' element={<Register />} />
        <Route path='/accounts/password/reset/' element={<ForgetPass />} />
        
        <Route path='/accounts/register/verify/' element={<Verify />} />
        <Route path='/accounts/password/reset/changepassword/' element={<ChangePassword />} />
        <Route path='/account/' element={<FrontPage />} />
        <Route path='/account/profile/:id/' element={<Profile />} />
        <Route path='/account/edit/' element={<ProfileEdit />} />
        <Route path='/account/explore/' element={<Explore />} />
        <Route path='/account/reels/' element={<Reels />} />
      </Routes>
    </div>
  );
};

export default App
