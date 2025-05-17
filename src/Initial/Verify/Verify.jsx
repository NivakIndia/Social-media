import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import {TfiEmail} from 'react-icons/tfi'
import './Verify.css'
import ApiFunctions from '../../ApiFunctions'


const Verify = () => {

    const { toCheckVerificationCode, toResendCode, toGetUserIdbyId } = ApiFunctions();
    const[userId,setUserId] = useState();

    // Resend Timer
    const initialTimeLeft = 180;
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

    // Handle Form change
    const [userCode, setUserCode] = useState({
        code:0
    })

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setUserCode({
            ...userCode,
            [name]:value
        })
    }

    // Check Verification
    const checkVerification = async (e) =>{
        e.preventDefault();
        await toCheckVerificationCode({id: Cookies.get('_id'), VerifyCode: userCode.code})
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
      setUserId((await toGetUserIdbyId({id: Cookies.get('_id')})).data.data)
    }
    
    // useEffects for Resend timing
    useEffect(() => {
      getUserId();
    },[])

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

  return (
      <div className='verify-content-container'>
          <div className='verify-container'>
              <TfiEmail className='lock-icon'/>
              <p className='heading'>Enter Confirmation code</p>
              <p>Enter the confirmation code we sent to {userId}. <span className='resendcode' onClick={!isResendDisabled ? resendCode : undefined} style={{color: isResendDisabled? "black":"#07609b"}}>Resend Code</span></p>
              {isResendDisabled && <p>Resend will be enabled in: <span className='resendcode'>{formatTime(timeLeft)}</span></p>}
              <form onSubmit={checkVerification}>
                  <input type='number' placeholder='Confirmation Code' name='code' onChange={handleInputChange} className='code' required/><br/>
                  <button type='sumbit' style={userCode.code <= 9999 ? {filter: 'blur(2px)', cursor:'not-allowed'} : {}} disabled={userCode.code <= 9999}>Verify</button>
              </form>
              <br/>
              <br/>
              <div className='verify-backlogin-container'>
                  <a href='/'><button>Back to Login</button></a>
              </div>
          </div>
      </div>
  )
}

export default Verify