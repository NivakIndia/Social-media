import React, { useEffect, useState } from 'react'
import './ProfileEdit.css'
import api from '../../api/axiosConfig'
import SideBar from '../SideBar/SideBar'
import { RxAvatar } from 'react-icons/rx'
import { Avatar } from '@mui/material'
import { DotLoader, SyncLoader } from 'react-spinners'
import Cookies from 'js-cookie'

const ProfileEdit = () => {
  const [loading, setloading] = useState(false)
  const [loadingpart, setloadingpart] = useState(false);

  const [user, setuser] = useState()

  //Get User
  const getUser= async()=>{
    try {
      const isUser = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
      setuser(isUser.data)
      setuserBio(isUser.data?.userBio ? `${isUser.data?.userBio} `:'')
      setloading(false)
    } catch (error) {
      setloading(false)
    }
  }

  //Profile Photo change
  const profileChange = async (event) => {
    setloadingpart(true)
    event.preventDefault()
    const formData = new FormData()
    formData.append('userid', user?.userId)
    formData.append('image',event.target.files[0])
    try {
      await api.post('/nivak/media/profilepic/', formData,{
        headers:{
          'Content-Type':'mutltipart/form-data'
        }
      })
      getUser()
      setloadingpart(false)
    } catch (error) {
    }
  }
  const buttonChange = () =>{
    const fileInput = document.getElementById('fileInput')
    if (fileInput) {
      fileInput.click()
    }
  }

  // Biometric Change
  const [userBio, setuserBio] = useState('')
  const initbio = userBio
  const [bio, setbio] = useState()
  const bioEnterAction = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const { selectionStart, selectionEnd } = event.target;
      const newText =
        bio.substring(0, selectionStart) +
        ';\n' +
        bio.substring(selectionEnd);

      setbio(newText);

      // Optionally, you can move the cursor to the end of the inserted newline
      const cursorPos = selectionStart + 1;
      event.target.setSelectionRange(cursorPos, cursorPos);
    }
  };
  const onBioChange = (event) => {
    const typedText = bio === undefined ? initbio : event.target.value
    setbio(typedText)
  };
  
  // Gender change
  const [gender, setgender] = useState('male');

  const selectGender = (event) => {
      setgender(event.target.value)
  };

  const sendBiometric = async () => {
    setloading(true)
    const formData = new FormData()
    formData.append('userid',user?.userId)
    formData.append('bio', bio)
    formData.append('gender', gender)
    try {
      await api.post('/nivak/media/biometric/', formData,{
        headers:{
          'Content-Type':'form-data'
        }
      })
      getUser()
      setloading(false)
    } catch (error) {
    }
  }
  

  

  
  useEffect(() => {
    setloading(true)
    getUser()
  }, [])
  

  return (
    <div className='profileedit'>
      <div className='loading' style={loading?{display:'flex'}:{display:'none'}}>
            <SyncLoader
            color={'#36d7b7'}
            loading={loading}
            />
      </div>
      
      <div className='profileedit_sidebar'>
        <SideBar/>
      </div>

      <div className='profileedit_container'>
          {/* Profile Edit Setting */}
          <div className='profileedit_setting'>
            <h1>Settings</h1>
            <div className='profileedit_setting_container'>
              <p><RxAvatar style={{width:'25px',height:'25px'}}/> Edit Profile</p>
            </div>
          </div>

          {/* Profile Edit Content */}
          <div className='profileedit_content'>
            
            <div className='profileedit_content_top'>
               
               <div className='heading'>
                <p>Edit profile</p>
               </div>

               <div className='profileedit_content_top_layer'>
                  <div className='avatar'>
                    <div className='loading-parts' style={loadingpart ? { display: 'flex', width:'70px',height:'70px', borderRadius:'50%'} : { display: 'none' }}>
                      <DotLoader
                        size={30}
                        color={'#ffffff'}
                        loading={loadingpart}
                      />
                    </div>
                    <Avatar>
                        {user?.profileURL ? <img src={user?.profileURL}/>:<img src='/profile.png'/>}
                    </Avatar>
                  </div>
                  <div className='content'>
                    <p>{user?.userName}</p>
                    <span>{user?.fullName}</span>
                  </div>
                  <input
                    type='file'
                    id='fileInput'
                    accept='Image/*'
                    style={{ display: 'none' }}
                    onChange={profileChange}
                  />
                  <button onClick={buttonChange}>Change photo</button>

               </div>
            </div>

            <div className='profileedit_content_bottom'>

              <div className='heading'>
                <p>Bio</p>
              </div>

              <div className='bio_container'>
                <textarea value={bio === undefined? userBio : bio} onChange={onBioChange} onKeyDown={bioEnterAction} rows={10} cols={100} placeholder='Type here....'/>
              </div>

              <div className='heading'>
                <p>Gender</p>
              </div>

              <div className='gender_container'>
                <select className="select" value={gender} onChange={selectGender}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className='biometric_sumbit'>
                  <button onClick={sendBiometric}>Sumbit</button>
              </div>

            </div>

          </div>

      </div>

    </div>
  )
}

export default ProfileEdit
