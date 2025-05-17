import React, { useEffect, useState } from 'react'
import './ProfileEdit.css'
import api from '../../api/axiosConfig'
import SideBar from '../SideBar/SideBar'
import { RxAvatar } from 'react-icons/rx'
import { Avatar } from '@mui/material'
import { DotLoader, SyncLoader } from 'react-spinners'
import Cookies from 'js-cookie'
import ApiFunctions from '../../ApiFunctions'
import ImageLoading from '../../Others/ImageLoading'

const ProfileEdit = () => {
  const {toGetUserData, toChangeProfileImage, toUpdateBiometric} = ApiFunctions()
  const [loading, setloading] = useState(false)

  const [user, setuser] = useState()

  //Get User
  const getUser= async()=>{
    const response = (await toGetUserData({id:Cookies.get('_id')})).data.data
    setuser(response)
    setuserBio(response?.userBio ? `${response?.userBio} `:'')
    setloading(false)
  }

  //Profile Photo change
  const profileChange = async (event) => {
    setloading(true)
    event.preventDefault()
    await toChangeProfileImage({id: user.id, image: event.target.files[0]})
    getUser()
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
        '\n' +
        bio.substring(selectionEnd);

      setbio(newText);

      // Optionally, you can move the cursor to the end of the inserted newline
      const cursorPos = selectionStart + 1;
      event.target.setSelectionRange(cursorPos, cursorPos);
    }
  };
  const onBioChange = (event) => {
    // const typedText = bio === undefined ? initbio : event.target.value
    setbio(event.target.value) // typedText
  };
  
  // Gender change
  const [gender, setgender] = useState('male');

  const selectGender = (event) => {
      setgender(event.target.value)
  };

  const sendBiometric = async () => {
    await toUpdateBiometric({id: user?.id, bio: bio, gender: gender})
    getUser();
  }
  
  
  useEffect(() => {
    getUser()
  }, [])
  

  return (
    <div className='profileedit'>
      
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
                    <div className='profileImage'>
                        {loading ? <ImageLoading isBackground={true} isCircle={true}/> : 
                          user?.profileURL ? <img src={user?.profileURL} className='profileImage'/>:<img src='/profile.png' className='profileImage'/>
                        }
                        
                    </div>
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
                  <button onClick={sendBiometric}>Submit</button>
              </div>

            </div>

          </div>

      </div>

    </div>
  )
}

export default ProfileEdit
