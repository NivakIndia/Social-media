import React, { useEffect, useState } from 'react'
import "./ForgetPass.css"
import api from "../../api/axiosConfig";
import { GoLock } from "react-icons/go";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BarLoader, SyncLoader } from 'react-spinners';
import { useLoader } from '../../Others/LoaderContext';
import ApiFunctions from '../../ApiFunctions';

const ForgetPass = () => {

    const { toResetPassword } = ApiFunctions()
    const { startLoader, stopLoader, invalidPath } = useLoader()

    const navigate = useNavigate()

    // Form handle change
    const [userData, setuserData] = useState({
        userid:""
    })
    const formHandleChange=(e)=>{
        const {name, value} = e.target;
        setuserData({
            ...userData,
            [name]:value
        })
    }

    // ForgetPassword function
    const forgetPassword = async (e) =>{
        e.preventDefault();
        await toResetPassword({userId: userData.userid})
    }
    

  return (
    
    <div className='forget-content-container'>
        <div className='forget-container'>
            <GoLock className='lock-icon'/>
            <p className='heading'>Trouble logging in?</p>
            <p>Enter your email or phonenumber and we'll send you a link to get back into your account.</p>
            <form onSubmit={forgetPassword}>
                <input type='text' placeholder='Phone number or Email' name='userid' required onChange={formHandleChange}/><br/>
                <button type='sumbit'>Send login link</button>
            </form>
            <p className='or'>OR</p>
            <a href='/accounts/register/' className='create-account'><button>Create new account</button></a>
            <div className='backlogin-container'>
                <a href='/'><button>Back to Login</button></a>
            </div>
        </div>
    </div>
  )
}

export default ForgetPass