import React, { useState } from 'react'
import toast from 'react-hot-toast';
import axios from "axios"
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'
import { login } from '../utils/userSlice';
import Input from '../components/Input';
import { googleAuth } from '../utils/firebase';
function AuthForm({ type }) {
  const [userData, setUserData] = useState({ name: "", email: "", password: "" });

  const dispatch = useDispatch()
  const navigate = useNavigate()
  async function handleAuthForm(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/${type}`, userData)
      console.log(res);
      if (type == "signup") {
        toast.success(res?.data?.message)
        navigate('/signin')
      } else {
        dispatch(login(res.data.user))
        toast.success(res?.data?.message)
        navigate('/')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message)

    } finally {
      setUserData({
        name: "", email: "", password: ""
      })

    }
  }
  // async function handleGoogleAuth(){
  //   try{
  //     let data=await googleAuth();
  //     const res=await axios.post(`${import.meta.env.VITE_BACKEND_URL}/google-auth`,{
  //       accessToken:data.accessToken
  //     },
  //   )
  //     console.log(res);
  //     dispatch(login(res?.data?.user))
  //     toast.success(res?.data?.message)
  //   }
  //   catch(error){
  //     toast.error(error?.response?.data?.message)
      
  //   }finally{
  //     navigate("/")
  //   }
  // }

  //   async function handleGoogleAuth() {
  //   try {
  //       let userData = await googleAuth();

  //       if (!userData) {
  //         return;
  //       }
  //       const idToken = await userData.getIdToken();

  //       const res = await axios.post(
  //         `${import.meta.env.VITE_BACKEND_URL}/google-auth`,
  //         {
  //           accessToken: idToken,
  //         }
  //       );

  //       dispatch(login(res?.data?.user));
  //       toast.success(res?.data?.message);
  //       navigate("/");
  //   } catch (error) {
  //     console.error("Google Auth Error:", error);
  //     toast.error(error?.response?.data?.message || "Authentication failed");
  //   }
  // }
    async function handleGoogleAuth() {
    try {
        let userData = await googleAuth();

        if (!userData) {
          return;
        }
        const idToken = await userData.getIdToken();

        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/google-auth`,
          {
            accessToken: idToken,
          }
        );

        dispatch(login(res?.data?.user));
        toast.success(res?.data?.message);
        navigate("/");
    } catch (error) {
      console.error("Google Auth Error:", error);
      toast.error(error?.response?.data?.message || "Authentication failed");
    }
  }



  return (
    <div className='w-full'>

      <div className='bg-gray-100 p-4 border-rounded-xl mx-auto max-w-[400px] flex flex-col items-center gap-5 mt-25'>
        <h1 className='text-3xl'>{type == "signin" ? "Sign In" : "Sign Up"}</h1>
        <form
          className='w-full flex flex-col items-center gap-5'
          onSubmit={handleAuthForm}
        >
          {
            type == "signup" && <Input type={"text"} placeholder={"Enter your name"} setUserData={setUserData} field={"name"} value={userData.name} icon={"fi-ss-user"}></Input>
          }


          <Input type={"email"} placeholder={"Enter your email"} setUserData={setUserData} field={"email"} value={userData.email} icon={"fi-br-at"}></Input>

          <Input type={"password"} placeholder={"Enter your password"} setUserData={setUserData} field={"password"} value={userData.password} icon={"fi-sr-eye-crossed"}></Input>

          <button
            type="submit"
            className='w-[100px] h-[50px] text-white text-xl p-2 rounded-md focus:outline-none bg-blue-500'
          >
            {type == "signin" ? "LogIn" : "Register"}
          </button>
        </form>
        <p className='text-xl font-semibold'>or</p>
        <div onClick={handleGoogleAuth} className='bg-white rounded-2xl cursor-pointer hover:bg-blue-200 flex gap-2 justify-center h-[50px] w-full'>
          <p className='text-2xl font-medium'>continue with</p>
          <div className='mt-1.5 ml-2'>
            <i className="cursor-pointer fi fi-brands-google w-8 h-8 text-2xl"></i>
          </div>
        </div>
        {type == "signin" ? <p>Dont't have an account?
          <Link to={'/signup'}>Sign Up</Link>
        </p> : <p>Already have an Account?
          <Link to={'/signin'}>Sign In</Link>
        </p>}
      </div>
    </div>
  );
}

export default AuthForm
