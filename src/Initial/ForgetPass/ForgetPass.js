import React, { useEffect, useState } from 'react'
import "./ForgetPass.css"
import api from "../../api/axiosConfig";
import { GoLock } from "react-icons/go";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BarLoader, SyncLoader } from 'react-spinners';

const ForgetPass = () => {
    const [loading, setloading] = useState(false)
    const [loadingapi,setloadingapi] = useState(false)
    const [allUser, setallUser] = useState()

    const navigate = useNavigate()
    const [msgError, setMsgError] = useState('');

    // Get All user
    const getAllUser = async() => {
        try {
            const response = await api.get('/nivak/media/allusers/')
            setallUser(response.data)
        } catch (error) {
        }
    }
    

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
        setloading(true)
        e.preventDefault();
        if (allUser?.some((user)=>user?.userId === userData.userid)) {
            try {
                await api.get(`/nivak/media/password/reset/${userData.userid}/`)
                Cookies.set("passid",userData.userid,{expires:1})
                setloadingapi(false)
                setloading(false)
                navigate("/accounts/password/reset/changepassword/")
              } catch (error) {
                setloading(false)
                setloadingapi(true)
              }
            
        } else {
            setloading(false)
            setMsgError("*User Not Found")
        }
    }

    useEffect(() => {
        getAllUser()
    }, [])
    

  return (
    <div>
        <div className='loading' style={loading?{display:'flex'}:{display:'none'}}>
          <SyncLoader
              color={'#36d7b7'}
              loading={loading}
          />
        </div>
        <div className='loading' style={loadingapi?{display:'flex'}:{display:'none'}}>
          <p style={{color:'#ff0000aa'}}>Server Error please try later</p>
          <br/>
          <BarLoader
              width={300}
              color={'#ff0000aa'}
              loading={loadingapi}
          />
        </div>
        <div className='forget-content-container'>
            <div className='forget-container'>
                <GoLock className='lock-icon'/>
                <p className='heading'>Trouble logging in?</p>
                <p>Enter your email or phonenumber and we'll send you a link to get back into your account.</p>
                <form onSubmit={forgetPassword}>
                    <input type='text' placeholder='Phone number or Email' name='userid' required onChange={formHandleChange}/><br/>
                    <button type='sumbit'>Send login link</button>
                </form>
                {msgError && <div className='msgError'><br/>{msgError}</div>}
                <p className='or'>OR</p>
                <a href='/accounts/register/' className='create-account'><button>Create new account</button></a>
                <div className='backlogin-container'>
                    <a href='/'><button>Back to Login</button></a>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ForgetPass