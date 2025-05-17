import React, { useEffect, useState } from 'react'
import "./Register.css"
import { RxCheckCircled, RxCrossCircled } from "react-icons/rx";
import ApiFunctions from '../../ApiFunctions';

const Register = () => {

    const { toRegister, getUserIdAndNames } = ApiFunctions()

    const [isEmail, setIsEmail] = useState(true)
    const [isNumber, setIsNumber] = useState(false)

    const [usersToCheck, setusersToCheck] = useState();

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
        e.preventDefault()
        await toRegister({userName: userData.username, fullName: userData.fullname, userId: userData.userid, password: userData.password, code: userData.code})
    }

    // Get userid and names
    const getuserId$Names = async()=>{
        setusersToCheck((await getUserIdAndNames()).data.data)
    }

    // Checking is user allready there
    const checkUsers=()=>{
        const useridToCheck = userData.userid;
        const usernameToCheck = userData.username
        
        const useridExists = usersToCheck?.some((user) => user.userId === useridToCheck)
        const usernameExists = usersToCheck?.some((user) => user.userName === usernameToCheck)

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
        getuserId$Names()
    },[])
    useEffect(()=>{
        checkUsers();
    })

  return (
    <div className='register-container'>
        <div className='register-datas' id='register'>
            <div className='register-form'>
                <form onSubmit={registerUser}>
                    <img src='/logo192.png' alt='logo' style={{ width: "50px", height: "30px" }} className='logo'/>
                    <p>Enroll into our media platform and explore the world with your new friends.</p>
                    <div className='username_field userid'>
                        <input type='text' name='username' placeholder='Username' required value={userData.username} onChange={formHandleChange}/><span className='tick-wrong'>{userName ? <RxCheckCircled style={{color:'green'}}/>:<RxCrossCircled style={{color:'red'}}/>}</span>
                        <button type="button" onClick={changeUseridType}>{isEmail?<span style={{fontSize:'10px'}}>Number</span>:<span style={{fontSize:'10px'}}>Email</span>}</button>
                    </div>
                    <input type='text' name='fullname' placeholder='Full Name' value={userData.fullname} required onChange={formHandleChange} />
                    <div className='userid'>
                        {isEmail && <><input type='email' name='userid' placeholder='Email' value={userData.userid} required onChange={formHandleChange} autoComplete="userid"/><span className='useridtick-wrong'>{userId ? <RxCheckCircled style={{color:'green'}}/>:<RxCrossCircled style={{color:'red'}}/>}</span></>}
                        {isNumber && <><input type='number' name='code' defaultValue="91" value={userData.code} readOnly onChange={formHandleChange} className='code' /><input type='number' name='userid' placeholder='Unavailable Now' readOnly value={userData.userid} onChange={formHandleChange} className='number' autoComplete="userid"/><span className='useridtick-wrong' style={{display:"none"}}>{userId ? <RxCheckCircled style={{color:'green'}}/>:<RxCrossCircled style={{color:'red'}}/>}</span></>}
                    </div>
                    <input type='password' name='password' placeholder='password' value={userData.password} required onChange={formHandleChange} autoComplete='current-password'/>
                    <button type='submit' style={isButtonDisabled  ? {cursor: 'not-allowed', filter: "blur(2px)"} : {}} disabled={isButtonDisabled}>Sign up</button>
                </form>
            </div>
            <p className='or-field'>or</p>
            <div className='page-change'>
                <p>Already have an account? <a href='/'>Log in</a></p>
            </div>
        </div>
    </div>
  )
}
//
export default Register