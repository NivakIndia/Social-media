import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { TbPasswordUser } from 'react-icons/tb'
import { RxCheckCircled, RxCrossCircled } from "react-icons/rx";
import api from '../../api/axiosConfig'
import './ChangePassword.css'
import { useNavigate } from 'react-router-dom'


const ChangePassword = () => {
    const navigate = useNavigate()
    const[user,setUser] = useState();
    const [msgError, setMsgError] = useState('');
    const [crtcode, setcrtcode] = useState()
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    // Resend Timer
    const initialTimeLeft = 300; // Initial time in seconds
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

    // Handle Form change
    const [userCode, setUserCode] = useState({
        code:0,
        password:""
    })

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setUserCode({
            ...userCode,
            [name]:value
        })
    }

    // Change Password
    const changePassword = async (e) =>{
        e.preventDefault();
        try {
            const formData = new FormData
            formData.append("userid",user?.userId)
            formData.append("newpassword",userCode.password)
            await api.post("/nivak/media/password/reset/changepassword/",formData)
            .then(response => {
                console.log('Success:', response.data);
                
            })
            .catch((error) => {
                console.error('Error:', error);
            });
            Cookies.remove('passid',{path:'/'})
            Cookies.set('user',user?.userId,{expires: 2})
            navigate("/accounts/home/")
        } catch (error) {
            console.log(error);
            setMsgError("*Invalid Code");
        }        
    }

    // Resend code
    const resendCode = async () => {
      setIsResendDisabled(true); 
      setTimeLeft(initialTimeLeft); 
      const currentTime = Math.floor(Date.now() / 1000);
      localStorage.setItem('startTime', currentTime.toString());
      localStorage.setItem('timer', initialTimeLeft.toString());

      await api.get(`/nivak/media/password/reset/changepassword/resendcoden/${user?.userId}/`)
      getUsers()
    };
  
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Get user by userId
    const getUsers = async () =>{
      const response = await api.get(`/nivak/media/byuserid/${Cookies.get("passid")}/`)
      setUser(response.data)
    }

    // Check code is correct 
    const checkCode=()=>{
        const codeToCheck = userCode.code;
        const originalCode = user?.forgetPassToken
        
        if (codeToCheck == originalCode) {
            setcrtcode(true);
            setIsButtonDisabled(false)
        } else {
            setcrtcode(false);
            setIsButtonDisabled(true)
        }
        
    }
    
    // useEffects for Resend timing
    useEffect(() => {
      getUsers()
      let timer;
  
      if (isResendDisabled) {
        timer = setInterval(() => {
          setTimeLeft(prevTime => {
            if (prevTime === 0) {
              clearInterval(timer);
              setIsResendDisabled(false); 
              localStorage.removeItem('startTime');
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      }
  
      return () => {
        clearInterval(timer);
      };
    }, [isResendDisabled]);
  
    useEffect(() => {
      const storedStartTime = localStorage.getItem('startTime');
      if (storedStartTime && isResendDisabled === false) {
        const storedTimeLeft = localStorage.getItem('timer');
        const currentTime = Math.floor(Date.now() / 1000);
        const storedStartTimeInt = parseInt(storedStartTime);
        const elapsedTime = currentTime - storedStartTimeInt;
  
        if (elapsedTime < initialTimeLeft && storedTimeLeft !== null) {
          const remainingTime = initialTimeLeft - elapsedTime;
          setTimeLeft(remainingTime > 0 ? remainingTime : 0);
          setIsResendDisabled(true);
        } else {
          localStorage.removeItem('startTime');
          localStorage.removeItem('timer');
        }
      }
    }, [initialTimeLeft, isResendDisabled]);

    useEffect(()=>{
        checkCode();
    })

  return (
    <div>
        <div className='passverify-content-container'>
            <div className='passverify-container'>
                <TbPasswordUser className='passlock-icon'/>
                <p className='passheading'>Change Password</p>
                <p>Enter the confirmation code we sent to {user?.userId}. <span className='passresendcode' onClick={!isResendDisabled ? resendCode : undefined} style={{color: isResendDisabled? "black":"#07609b"}}>Resend Code</span></p>
                {isResendDisabled && <p>Resend will be enabled in: <span className='passresendcode'>{formatTime(timeLeft)}</span></p>}
                <form onSubmit={changePassword}>
                    <input type='number' placeholder='Confirmation Code' name='code' onChange={handleInputChange} className='code' required/><span className='changepasstick-wrong'>{crtcode ? <RxCheckCircled style={{color:'green'}}/>:<RxCrossCircled style={{color:'red'}}/>}</span><br/>
                    <input type='password' placeholder='New Password' name='password' onChange={handleInputChange} className='code' required/><br/>
                    {msgError && <div className='msgError'>{msgError}</div>}
                    <button type='sumbit' disabled={isButtonDisabled}>Change Password</button>
                </form>
                <br/>
                <br/>
            </div>
            <div className='passverify-backlogin-container'>
                <a href='/'><button>Back to Login</button></a>
            </div>
        </div>
    </div>
  )
}

export default ChangePassword