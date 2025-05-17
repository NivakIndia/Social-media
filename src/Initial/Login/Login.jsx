import React, { useState } from 'react'
import './Login.css'
import ApiFunctions from '../../ApiFunctions';

const Login = () => {
    const { toLogin } = ApiFunctions()

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

    // Login user
    const loginHandle = async (e) => {
        e.preventDefault();
        await toLogin({ userLogin: userData.login, userPassword: userData.password, setisNotVerified: setisNotVerified });
    };

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
                    <br/>
                    <a href='/accounts/password/reset/'>Forget password?</a>
                    {isNotVerified && <span>Account is Not Verified, <a href='/accounts/register/verify/' style={{textDecoration: 'none'}}>Verify?</a></span>}
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
  )
}

export default Login