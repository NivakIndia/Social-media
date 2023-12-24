import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import {TfiEmail} from 'react-icons/tfi'
import api from '../../api/axiosConfig'
import './Verify.css'
import { useNavigate } from 'react-router-dom'
import { BarLoader, SyncLoader } from 'react-spinners'


const Verify = () => {
    const [loading, setloading] = useState(false)
    const [loadingapi,setloadingapi] = useState(false)

    const navigate = useNavigate()
    const userid = Cookies.get('userid');
    const[user,setUser] = useState();
    const [msgError, setMsgError] = useState('');

    // Resend Timer
    const initialTimeLeft = 300; // Initial time in seconds
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
        setloading(true)
        e.preventDefault();
        const vCode = Number(user?.verificationToken)
        const code = userCode.code
        if(vCode === code){
          try {
            await api.get(`/nivak/media/register/verify/${userid}/`)
            Cookies.remove('userid',{path:'/'})
            Cookies.set('user',userid,{expires: 2})
            setloading(false)
            navigate("/account/")
          } catch (error) {
            setloading(false)
            setMsgError("*Invalid Code");
          }
        }
        else {
          setloading(false)
          setMsgError("*Incorrect Code")
        }          
    }

    // Resend code
    const resendCode = async () => {
      setIsResendDisabled(true); 
      setTimeLeft(initialTimeLeft); 
      const currentTime = Math.floor(Date.now() / 1000);
      localStorage.setItem('startTime', currentTime.toString());
      localStorage.setItem('timer', initialTimeLeft.toString());

      await api.get(`/nivak/media/register/verify/resendcode/${userid}/`)
      getUsers()
    };
  
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Get user by userId
    const getUsers = async () =>{
      try {
        const response = await api.get(`/nivak/media/byuserid/${Cookies.get("userid")}/`)
        setUser(response.data)
        setloadingapi(false)
        setloading(false)
      } catch (error) {
        setloading(false)
        setloadingapi(true)
      }
      
    }
    
    // useEffects for Resend timing
    useEffect(() => {
      setloading(true)
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
        <div className='verify-content-container'>
            <div className='verify-container'>
                <TfiEmail className='lock-icon'/>
                <p className='heading'>Enter Confirmation code</p>
                <p>Enter the confirmation code we sent to {userid}. <span className='resendcode' onClick={!isResendDisabled ? resendCode : undefined} style={{color: isResendDisabled? "black":"#07609b"}}>Resend Code</span></p>
                {isResendDisabled && <p>Resend will be enabled in: <span className='resendcode'>{formatTime(timeLeft)}</span></p>}
                <form onSubmit={checkVerification}>
                    <input type='number' placeholder='Confirmation Code' name='code' onChange={handleInputChange} className='code' required/><br/>
                    {msgError && <div className='msgError'>{msgError}</div>}
                    <button type='sumbit'>Verify</button>
                </form>
                <br/>
                <br/>
                <div className='verify-backlogin-container'>
                    <a href='/'><button>Back to Login</button></a>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Verify