import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { TbPasswordUser } from 'react-icons/tb'
import { RxCheckCircled, RxCrossCircled } from "react-icons/rx";
import './ChangePassword.css'
import { useNavigate } from 'react-router-dom'
import { useLoader } from '../../Others/LoaderContext';
import ApiFunctions from '../../ApiFunctions';


const ChangePassword = () => {

    const { invalidPath } = useLoader()

    const { toChangePassword, toResendCode, toGetUserIdbyId, toGetVerificationCode } = ApiFunctions();

    const navigate = useNavigate()
    const id = Cookies.get("_id")
    const [userId, setUserId] = useState()
    const [code, setcode] = useState()
    const [crtcode, setcrtcode] = useState()
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
   

    // Resend Timer
    const initialTimeLeft = 180;
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
        await toChangePassword({userId: userId, password: userCode.password})
    }

    // Resend code
    const resendCode = async () => {
        await toResendCode({userId: userId, initialTimeLeft: initialTimeLeft, setIsResendDisabled: setIsResendDisabled, setTimeLeft: setTimeLeft})
    };
  
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Get user by userId
    const getUserId = async () =>{
      try {
        const userid = await (await toGetUserIdbyId({id: Cookies.get('_id')})).data.data
        setUserId(userid)
        setcode((await toGetVerificationCode({userId: userid})).data.data)
      } catch (error) {
      }
      
    }

    // Check code is correct 
    const checkCode=()=>{
        const codeToCheck = Number(userCode.code);
        const originalCode = code;
        
        if (codeToCheck === originalCode) {
            setcrtcode(true);
            setIsButtonDisabled(false)
        } else {
            setcrtcode(false);
            setIsButtonDisabled(true)
        }
        
    }
    
    // useEffects for Resend timing
    useEffect(() => {
      if(Cookies.get("_id") == null){
        invalidPath()
        navigate("/")
      }
      else
        getUserId();
    }, [])
    
    useEffect(() => {
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
    <div className='passverify-content-container'>
        <div className='passverify-container'>
            <TbPasswordUser className='passlock-icon'/>
            <p className='passheading'>Change Password</p>
            <p>Enter the confirmation code we sent to {userId}. <span className='passresendcode' onClick={!isResendDisabled ? resendCode : undefined} style={{color: isResendDisabled? "black":"#07609b"}}>Resend Code</span></p>
            {isResendDisabled && <p>Resend will be enabled in: <span className='passresendcode'>{formatTime(timeLeft)}</span></p>}
            <form onSubmit={changePassword}>
                <div>
                  <input type='number' placeholder='Confirmation Code' name='code' onChange={handleInputChange} className='code' required/><span className='changepasstick-wrong'>{crtcode ? <RxCheckCircled style={{color:'green'}}/>:<RxCrossCircled style={{color:'red'}}/>}</span><br/>
                </div>
                <input type='password' placeholder='New Password' name='password' onChange={handleInputChange} className='code' required/><br/>
                <button type='sumbit' disabled={isButtonDisabled} style={!crtcode ? {filter : "blur(2px)", cursor: "not-allowed"} : {}}>Change Password</button>
            </form>
            <br/>
            <br/>
            <div className='passverify-backlogin-container'>
                <a href='/'><button>Back to Login</button></a>
            </div>
        </div>
    </div>
  )
}

export default ChangePassword