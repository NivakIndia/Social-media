import React, { useEffect, useState } from 'react'
import api from "../api/axiosConfig";
import Cookies from 'js-cookie';

const Home = () => {
    const [user, setUser] = useState()
    const getUser=async()=>{
        const response = await api.get(`/nivak/media/byuserid/${Cookies.get('user')}/`)
        setUser(response.data)
    }
    useEffect(()=>{
        getUser()
    },[])
  return (
    <div>
        <h3>Welcome {user?.fullName}</h3>
    </div>
  )
}

export default Home