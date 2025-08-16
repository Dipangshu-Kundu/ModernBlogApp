import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from 'react'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import AuthForm from './pages/AuthForm'
import NavBar from './components/NavBar'
import HomePage from './components/HomePage'
import AddBlog from './pages/AddBlog'
import BlogPage from './pages/BlogPage'
import VerifyUser from './components/VerifyUser'
import ProfilePage from './pages/ProfilePage'
import EditProfile from './pages/EditProfile'
import SearchBlogs from './pages/SearchBlogs'
import Setting from './components/Setting'

function App() {
  return (
    <div className='w-screen h-screen'>
      <Routes>
        <Route path="/" element={<NavBar></NavBar>}>
          <Route path='/' element={<HomePage></HomePage>}></Route>
          <Route path='/signin' element={<AuthForm type='signin'></AuthForm>}></Route>
          <Route path='/signup' element={<AuthForm type='signup'></AuthForm>}></Route>
          <Route path='/add-blog' element={<AddBlog></AddBlog>}></Route>
          <Route path='/blog/:id' element={<BlogPage></BlogPage>}></Route>
          <Route path='/edit/:id' element={<AddBlog></AddBlog>}></Route>
          <Route path='/verify-email/:verificationToken' element={<VerifyUser></VerifyUser>}></Route>

          <Route path='/:username' element={<ProfilePage></ProfilePage>}></Route>
          <Route path='/:username/saved-blogs' element={<ProfilePage></ProfilePage>}></Route>
          <Route path='/:username/liked-blogs' element={<ProfilePage></ProfilePage>}></Route>
          <Route path='/:username/draft-blogs' element={<ProfilePage></ProfilePage>}></Route>
          <Route path='/edit-profile' element={<EditProfile></EditProfile>}></Route>
          <Route path='/search' element={<SearchBlogs></SearchBlogs>}></Route>
          <Route path='/tag/:tag' element={<SearchBlogs></SearchBlogs>}></Route>
          <Route path='/setting' element={<Setting></Setting>}></Route>
        </Route>

      </Routes>
    </div>
  )

}

export default App
