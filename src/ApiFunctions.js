import { useNavigate } from 'react-router-dom';
import api from './api/axiosConfig';
import { useLoader } from './Others/LoaderContext';
import Cookies from 'js-cookie';

const ApiFunctions = () => {
  const { startLoader, stopLoader } = useLoader();
  const navigate = useNavigate()

  const config_json = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000,
  };

  const config_formData = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 10000,
  }

  /* Login User */ 
  const toLogin = async ({ userLogin, userPassword, setisNotVerified}) => {    
    startLoader("Logging In...");
    try {
        const response = await api.post("/nivak/user/login/", null, {
            params: {
                userid: userLogin,       
                password: userPassword
            },
            ...config_json
        });
      
      if (response.data.success) {
        if (response.data.data.length === 1) {
          
          
          stopLoader(true, response.data.message);
          Cookies.set('_id', response.data.data[0], { expires: 2 });
          navigate(`/account/profile/${response.data.data[0]}/`);
        } else {
          stopLoader(false, "", response.data.message);
          Cookies.set('_id', response.data.data[0], { expires: 2 });
          setisNotVerified(true);
        }
      } else {
        setisNotVerified(false);
        stopLoader(false, "", response.data.message);
      }
    } catch (error) {
      setisNotVerified(false);
      navigate('/');
      stopLoader(false);
    }
  };

  /* Register */ 
  const toRegister = async ({userName, fullName, userId, password, code}) => {
    startLoader("User Registering....")
    const jsonData = {
        userName: userName,
        fullName: fullName,
        userId: userId,
        password: password,
        code: code,
    };
    try {
        const response = await api.post("/nivak/user/register/",jsonData,config_json);

        if(response.data.success){
            Cookies.set("_id",response.data.data,{expires:1})
            stopLoader(true, response.data.message)
            navigate("/accounts/register/verify/")
        }
        else{
            stopLoader(false,"",response.data.message)
        }
        
    } catch (error) {
        stopLoader(false)
    }
  }
 
  /* Get User Id and Names */
  const getUserIdAndNames = async () => {
    try {
        return await api.get("/nivak/user/getuserids$names/")
        
    } catch (error) {
    }
  }

  /* Change password */
  const toChangePassword = async ({userId, password}) => { 
    startLoader("Changing Password...")
    try {
      const formData = new FormData()
      formData.append("userid",userId)
      formData.append("newpassword",password)
      await api.post("/nivak/user/password/reset/changepassword/",formData, config_formData)
      .then(response => {
      })
      .catch((error) => {
      });

      stopLoader(true, "Password Changed Successfully")
      Cookies.remove('_id',{path:'/'})
      navigate("/")
    } catch (error) {
      stopLoader(false)
    }       
  }

  /* Resend Code */ 
  const toResendCode = async ({userId, initialTimeLeft, setIsResendDisabled, setTimeLeft}) => { 
      setIsResendDisabled(true); 
      setTimeLeft(initialTimeLeft); 
      const currentTime = Math.floor(Date.now() / 1000);
      localStorage.setItem('startTime', currentTime.toString());
      localStorage.setItem('timer', initialTimeLeft.toString());

      await api.get(`/nivak/user/password/reset/changepassword/resendcode/${userId}/`)
  }

  /* Get User Id by Id */
  const toGetUserIdbyId = async ({id}) => { 
    return (await api.get(`/nivak/user/useridbyid/${id}/`))
  }

  /* Get Verification Code */
  const toGetVerificationCode = async ({userId}) => {
    return (await api.get(`/nivak/user/getverificationcode/${userId}/`))
  }

  /* Password reset */
  const toResetPassword = async ({userId}) => { 
    startLoader("Verfication Code sending")
    try {
        const response = await api.get(`/nivak/user/password/reset/${userId}/`)
        if(response.data.success){
            Cookies.set("_id",response.data.data,{expires:1})
            navigate("/accounts/password/reset/changepassword/")
            stopLoader(true, response.data.message)
        }
        else{
            stopLoader(false,"", response.data.message)
        }
        
    } catch (error) {
        stopLoader(false)
    }
  }

  /* To Check Verification Code */
  const toCheckVerificationCode = async ({id, VerifyCode}) => {
    startLoader("Checking code...")
    const code = Number(VerifyCode)
    try {
      const response = await api.post(`/nivak/user/register/verify/`, null, {
        params: {
          id: id,
          code: code
        },
        ...config_json
      })
      if(response.data.success){
        stopLoader(true, response.data.message)
        navigate("/")
      }
      else{
        stopLoader(false, "", response.data.message)
      }
    } catch (error) {
      stopLoader(false)
    }       
  }

  /* To Get User Data */
  const toGetUserData = async ({id}) => {
    return await api.post("/nivak/user/getuserdata/", null, {
      params: {
          id: id
      },
      ...config_json
    })
  }

  /* To Get Profile Posts */
  const toGetProfilePosts = async ({id}) => {
    return await api.post("/nivak/post/profileposts/", null, {
      params: {
          id: id
      },
      ...config_json
    })
  }

  /* For Friend Intraction */
  const forFriendIntractions = async ({userId, userFriendId}) => {
    const formData = new FormData()
      formData.append('userid', userId)
      formData.append('userfriendid', userFriendId)
      await api.post('/nivak/user/userfriend/',formData, config_formData)
  }

  /* To Get Saved Posts */
  const toGetSavedPosts = async ({userId}) => {
    return  await api.post("/nivak/post/savedposts/", null, {
      params: {
          id: userId
      },
      ...config_json
    })
  }

  /* To Get Post */
  const toGetPost = async ({postId}) => {
      return await api.post("/nivak/post/postbyid/", null, {
        params: {
            id: postId
        },
        ...config_json
      })
  }

  /* To Post Comment */
  const forPostComment = async ({postId, userId, comment}) => {
    const formData = new FormData()
    formData.append('postid',postId)
    formData.append('userid',userId)
    formData.append('comment',comment)
    await api.post('/nivak/post/postcomment/',formData,config_formData)
  }

  /* For Post Intraction */
  const forPostIntraction = async ({postId, userId}) => {
    await api.post("/nivak/post/intraction/", null,{
      params : {
          postid: postId,
          userid: userId
      },
      ...config_json
    })
  }

  /* For Post Reply Comment */
  const forReplyComment = async ({postId, userId, commentId, commentMSG}) => {
    const formData = new FormData()
    formData.append('postid',postId)
    formData.append('userid',userId)
    formData.append('commentid',commentId)
    formData.append('commentmsg', commentMSG)
    await api.post('/nivak/post/postreplycomment/',formData, config_formData)
  }

  /* To Save Post */
  const toSavePost = async ({postId, userId}) => {
    await api.post("/nivak/user/savepost/", null, {
      params: {
          postid: postId,
          userid: userId
      },
      ...config_json
    })
  }

  /* For Comment Interaction */
  const forCommentInstraction = async ({postId, userId, commentId}) => {
    const formData = new FormData()
    formData.append('postid', postId)
    formData.append('userid', userId)
    formData.append('commentid', commentId)
    await api.post('/nivak/post/commentintraction/',formData, config_formData)
  }

  /* For Reply Comment Intraction */
  const forReplyCommentIntraction = async ({postId, userId, commentId, replyId}) => {
    await api.post('/nivak/post/replycommentintraction/',null,{
      params : {
          postid: postId,
          userid: userId,
          commentid: commentId,
          replyid: replyId
      },
      ...config_json
    })
  }

  /* To Get the Suggestions */
  const toGetSuggestions = async () => {
    return await api.post('/nivak/user/suggestions/', null, {
      params: {
        id: Cookies.get("_id")
      },
      ...config_json
    })
  }

  /* To Get the FrontPosts */
  const toGetFrontPosts = async ({id}) => {
    return await api.post('/nivak/post/frontposts/', null, {
      params: {
        id: id
      },
      ...config_json
    })
  }

  /* To Get the Change Profile */
  const toChangeProfileImage = async ({id, image}) => {
    const formData = new FormData()
    formData.append('userid',id)
    formData.append('image',image)
    await api.post('/nivak/user/profilepic/', formData, config_formData)
  }

  /* To Update Profile Biometric */
  const toUpdateBiometric = async ({id, bio, gender}) => {
    startLoader("Updating Biometric...")
    const formData = new FormData()
    formData.append('userid',id)
    formData.append('bio',bio)
    formData.append('gender',gender)
    const response = (await api.post('/nivak/user/biometric/', formData, config_formData)).data
    if(response.success){
      stopLoader(true, response.message)
    }else{
      stopLoader(false)
    }

  }


  /* To Get All Posts */
  const toGetAllPosts = async ({page, size, id, isReels}) => {
    return await api.post('/nivak/post/allposts/', null, {
      params: {
        page: page,
        size: size,
        id: id,
        isReels: isReels
      },
    });
  }

  /* To Get User Friends */
  const toGetUserFriends = async ({id, type}) => {
    return await api.post('/nivak/user/userfriends/', null, {
      params: {
        id: id,
        type: type
      },
      ...config_json
    })
  }

  /* Seen Notification */
  const toSeenNotification = async ({notificationId, id}) => {
    try {
      const formData = new FormData()
      formData.append("userid",id)
      formData.append("notificationid",notificationId)
      await api.post("/nivak/user/notificationseen/", formData, config_formData)
    } catch (error) {
      
    }
  }



  return {
    toLogin,                              /* Login */
    toRegister,                           /* Register */
    getUserIdAndNames,                    /* Register -- Friends */
    toChangePassword,                     /* ChangePassword */
    toResendCode,                         /* ChangePassword -- Verify */
    toGetUserIdbyId,                      /* ChangePassword -- Verify */
    toGetVerificationCode,                /* ChangePassword */
    toResetPassword,                      /* ForgetPass */
    toCheckVerificationCode,              /* Verify */

    toGetUserData,                        /* Profile -- OverlayPost -- CommentDetails  -- Suggestions -- FrontPost -- ProfileEdit -- Reels -- Friends*/
    toGetProfilePosts,                    /* Profile */
    forFriendIntractions,                 /* Profile -- Suggestions -- Reels -- Friends */
    toGetSavedPosts,                      /* Mediaview -- Reels */
    toGetPost,                            /* MediaView -- OverlayPost -- FrontPost -- Explorer -- Reels */
    forPostComment,                       /* OverlayPost -- FrontPost */
    forPostIntraction,                    /* OverlayPost -- FrontPost -- Reels */
    forReplyComment,                      /* OverlayPost */
    toSavePost,                           /* OverlayPost -- Reels */
    forCommentInstraction,                /* CommentDetails */
    forReplyCommentIntraction,            /* CommentDetails */
    toGetSuggestions,                     /* Suggestions */
    toGetFrontPosts,                      /* FrontPosts */
    toChangeProfileImage,                 /* ProfileEdit */
    toUpdateBiometric,                    /* ProfileEdit */
    toGetAllPosts,                        /* Explore -- Reels */
    toGetUserFriends,                     /* Friends */
    toSeenNotification,                   /* Notification */
  };
};

export default ApiFunctions;
