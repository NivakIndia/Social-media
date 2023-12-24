import React, { useEffect, useState } from 'react'
import api from "../../api/axiosConfig";
import "./Register.css"
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { RxCheckCircled, RxCrossCircled } from "react-icons/rx";
import { BarLoader, SyncLoader } from 'react-spinners';

const Register = () => {
    const [loading, setloading] = useState(false)
    const [loadingapi,setloadingapi] = useState(false)

    const navigate = useNavigate()
    const [msgError, setMsgError] = useState('');
    const [isEmail, setIsEmail] = useState(true)
    const [isNumber, setIsNumber] = useState(false)

    const [allUsers, setallUsers] = useState()

    const [userId, setUserId] = useState(false)
    const [userName, setUserName] = useState(false)
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    // Handle Change
    const [userData, setuserData] = useState(
        {
            username:"",
            fullname:"",
            userid:"",
            password:"",
            code:"91"
        }
    )

    const formHandleChange=(e)=>{
        const {name, value} = e.target;
        const lowerCaseValue = name === 'username' ? value.toLowerCase() : value;
        setuserData({
            ...userData,
            [name]:lowerCaseValue
        })
    }


    // Change type of userid
    const changeUseridType =()=>{
        setIsEmail((prevIsEmail) => !prevIsEmail);
        setIsNumber((prevIsNumber) => !prevIsNumber);
    }

    // Register user
    const registerUser = async (e) =>{
        setloading(true)
        e.preventDefault()
        const formData = new FormData()
        formData.append("username",userData.username)
        formData.append("fullname",userData.fullname)
        formData.append("userid",userData.userid)
        formData.append("password",userData.password)
        formData.append("countrycode",userData.code)
        try {
            await api.post("/nivak/media/register/",formData)
            .then(response => {
            })
            .catch(error => {
            });
            Cookies.set("userid",userData.userid,{expires:1})
            setloading(false)
            navigate("/accounts/register/verify/")
        } catch (error) {
            setloading(false)
            setMsgError("*Error in Registration")
        }
    }

    // Get All users
    const getAllUsers=async()=>{
        try {
            const response = await api.get("/nivak/media/allusers/")
            setallUsers(response.data)
            setloadingapi(false)
            setloading(false)
          } catch (error) {
            setloading(false)
            setloadingapi(true)
          }
        
    }

    // Checking is user allready there
    const checkUsers=()=>{
        const useridToCheck = userData.userid;
        const usernameToCheck = userData.username

        const useridExists = allUsers?.some((user) => user.userId === useridToCheck)
        const usernameExists = allUsers?.some((user) => user.userName === usernameToCheck)

        if (useridToCheck.trim() === '') {
            setUserId(false);
        } else {
            setUserId(!useridExists);
        }
    
        if (usernameToCheck.trim() === '') {
            setUserName(false);
        } else {
            setUserName(!usernameExists);
        }

        if (userId && userName) {
            setIsButtonDisabled(false)
        } else {
            setIsButtonDisabled(true)
        }
    }

    useEffect(()=>{
        setloading(true)
        getAllUsers();
    },[])
    useEffect(()=>{
        checkUsers();
    })

  return (
    <>
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
        <div className='register-container'>
            <div className='register-datas' id='register'>
                <div className='register-form'>
                    <form onSubmit={registerUser}>
                        <img src='/logo192.png' alt='logo' style={{ width: "50px", height: "30px" }} className='logo'/>
                        <p>Enroll into our media platform and explore the world with your new friends.</p>
                        <div>
                            <input type='text' name='username' placeholder='Username' required value={userData.username} onChange={formHandleChange}/><span className='tick-wrong'>{userName ? <RxCheckCircled style={{color:'green'}}/>:<RxCrossCircled style={{color:'red'}}/>}</span>
                        </div>
                        <input type='text' name='fullname' placeholder='Full Name' required onChange={formHandleChange}/>
                        <div className='userid'>
                            {isEmail && <><input type='email' name='userid' placeholder='Email' required onChange={formHandleChange}/><span className='useridtick-wrong'>{userId ? <RxCheckCircled style={{color:'green'}}/>:<RxCrossCircled style={{color:'red'}}/>}</span></>}
                            {isNumber && <><input type='number' name='code' defaultValue="91" readOnly onChange={formHandleChange} className='code'/><input type='number' name='userid' placeholder='Unavailable Now' readOnly onChange={formHandleChange} className='number'/><span className='useridtick-wrong' style={{display:"none"}}>{userId ? <RxCheckCircled style={{color:'green'}}/>:<RxCrossCircled style={{color:'red'}}/>}</span></>}
                            <button type="button" onClick={changeUseridType}>{isEmail?<span style={{fontSize:'10px'}}>Number</span>:<span style={{fontSize:'10px'}}>Email</span>}</button>
                        </div>
                        <input type='password' name='password' placeholder='password' required onChange={formHandleChange}/>
                        <button type='submit' disabled={isButtonDisabled}>Sign up</button>
                        {msgError && <div className='msgError'>{msgError}</div>}
                    </form>
                </div>
                <p>or</p>
                <br/>
                <div className='page-change'>
                    <p>Already have an account? <a href='/'>Log in</a></p>
                </div>
            </div>
        </div>
    </>
  )
}

export default Register