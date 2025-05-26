import React from 'react'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Login from '../screens/Login'
import Register from '../screens/Register'
import Home from '../screens/Home'
import Project from '../screens/Project'
import UserAuth from '../auth/UserAuth'

const AppRoutes = () => {
    return (
        <BrowserRouter>

            <Routes>
                {/* <Route path="/" element={<UserAuth><Home /></UserAuth>} /> */}
                <Route path="/" element={<Login/>} />
                <Route path="/login" element={<Home/>} />
                <Route path="/register" element={<Register />} />
                <Route path="/project" element={<UserAuth><Project /></UserAuth>} />
                {/* <Route path="/project" element={<Project />} /> */}

            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes