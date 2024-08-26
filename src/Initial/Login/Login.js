import React, { useEffect, useState } from 'react'
import './Login.css'
import api from "../../api/axiosConfig";
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie';
import { BarLoader, SyncLoader } from 'react-spinners';

const Login = () => {
    const [loading, setloading] = useState(false)
    const [loadingapi,setloadingapi] = useState(false)

    const navigate = useNavigate()
    const [allUsers, setallUsers] = useState();
    const [msgError, setMsgError] = useState('');
    const [isNotVerified, setisNotVerified] = useState(false)

    const [userData, setuserData] = useState({
        login:'',
        password:''
    })
    

    // HandleInputs
    const handleInputChange = (e) =>{
        const{name,value}=e.target;
        setuserData({
            ...userData,
            [name]:value
        })
    }

    // GetUser
    const getAllUsers = async () => {
        try {
            const response = await api.get('/nivak/media/allusers/')
            setallUsers(response.data)
            setloadingapi(false)
            setloading(false)
        } catch (error) {
            setloading(false)
            setloadingapi(true)
        }
        
    }
    // Login user
    const loginHandle =async (e) => {
        
        e.preventDefault()
        try {
            setloading(true)
            const loginToCheck = userData.login
            const passwordToCheck = userData.password
            console.log(loginToCheck);
            console.log(passwordToCheck);
            console.log(allUsers);
            
            
            const usernameExists = allUsers?.some((user)=> user?.userName === loginToCheck)
            const useridExists = allUsers?.some((user)=>user?.userId === loginToCheck)

            if(usernameExists || useridExists){
                const response = await api.get(`/nivak/media/login/${loginToCheck}/`)
                const data = response.data
                if (data?.password === passwordToCheck) {
                    if(data?.accountIsVerified){
                        Cookies.set('user',data?.userId,{expires: 2})
                        setloading(false)
                        navigate("/account/")
                    }
                    else{
                        setloading(false)
                        setMsgError("*Email is not verified! ")
                        Cookies.set('userid',data?.userId,{expires:1})
                        setisNotVerified(true)
                    }
                } else {
                    setloading(false)
                    setMsgError("*Incorrect password")
                    setisNotVerified(false)
                }
            }
            else{
                setloading(false)
                setMsgError("*User not found")
                setisNotVerified(false)
            }
            
        } catch (error) {
            setloading(false)
            navigate('/')
        }

    }

    useEffect(()=>{
        Cookies.remove('user')
        getAllUsers()
    },[])
  return (
    <>
        <div className='loading' style={loading?{display:'flex'}:{display:'none'}}>
            <p style={{color: "#36d7b7"}}>*May it take some time initially to restart server wait patiently</p>
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
        <div className='login-container'>
            <div className='login-datas' id='login'>
                <div className='login-form'>
                    <form onSubmit={loginHandle}>
                        <img src='/logo192.png' alt='logo' style={{ width: "50px", height: "30px" }} className='logo'/>
                        <p>Welcome to Nivak's media, Here you can connect with peoples, share your thoughts, find new friends.</p>
                        <input type='text' name='login' placeholder='Phonenumber, username or email' required onChange={handleInputChange}/>
                        <input type='password' name='password' placeholder='password' required onChange={handleInputChange}/>
                        <button type='submit'>Log in</button>
                        {msgError && <div className='msgError' style={{marginTop:"-10px"}}>{msgError}{isNotVerified && <a href='/accounts/register/verify/' style={{textDecoration: 'none'}}>Verify?</a>}</div>}
                        <br/>
                        <a href='/accounts/password/reset/'>Forget password?</a>
                    </form>
                </div>
                <div className='or'>
                    <p>or</p>
                </div>
                <br/>
                <div className='page-change'>
                    <p>Don't have an account? <a href='/accounts/register/'>Sign up</a></p>
                </div>
            </div>
        </div>
    </>
  )
}

export default Login