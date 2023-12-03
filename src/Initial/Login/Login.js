import React, { useEffect, useState } from 'react'
import './Login.css'
import api from "../../api/axiosConfig";
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie';

const Login = () => {
    const navigate = useNavigate()
    const [allUsers, setallUsers] = useState();
    const [loginError, setloginError] = useState()
    const [isNotVerified, setisNotVerified] = useState(false)

    const [userData, setuserData] = useState({
        login:'',
        password:''
    })
    const [msgError, setMsgError] = useState('');

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
        const response = await api.get('/nivak/media/allusers/')
        setallUsers(response.data)
    }
    // Login user
    const loginHandle =async (e) => {
        e.preventDefault()
        try {
            const loginToCheck = userData.login
            const passwordToCheck = userData.password

            const usernameExists = allUsers?.some((user)=> user?.userName === loginToCheck)
            const useridExists = allUsers?.some((user)=>user?.userId === loginToCheck)

            if(usernameExists || useridExists){
                const response = await api.get(`/nivak/media/login/${loginToCheck}/`)
                const data = response.data
                if (data?.password === passwordToCheck) {
                    if(data?.accountIsVerified){
                        Cookies.set('user',data?.userId,{expires: 2})
                        navigate("/accounts/home/")
                    }
                    else{
                        setMsgError("*Email is not verified! ")
                        Cookies.set('userid',data?.userId,{expires:1})
                        setisNotVerified(true)
                    }
                } else {
                    setMsgError("*Incorrect password")
                    setisNotVerified(false)
                }
            }
            else{
                setMsgError("*User not found")
                setisNotVerified(false)
            }
            
        } catch (error) {
            console.log(error)
            navigate('/')
        }

    }

    useEffect(()=>{
        getAllUsers()
    },[])
  return (
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
                        <a href='/accounts/password/reset/'>Forget password?</a>
                    </form>
                </div>
                <div className='or'>
                    <hr/>
                    <p>or</p>
                </div>
                <div className='page-change'>
                    <p>Don't have an account? <a href='/accounts/register/'>Sign up</a></p>
                </div>
            </div>
        </div>
  )
}

export default Login