import React, { useState } from 'react'

function Input({ type, placeholder, value, setUserData, field, icon }) {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <div className='relative w-full'>
            <i className={"fi " + icon + " absolute top-1/2 -translate-y-1/2 left-4 mt-1 opacity-50"}></i>
            <input
                type={type != "password"?type:showPassword?"text":"password"}
                className='w-full h-[50px] text-black text-xl p-2 rounded-md focus:outline-none bg-white rounded-full pl-10'
                value={value}
                placeholder={placeholder}
                onChange={(e) => setUserData(prev => ({ ...prev, [field]: e.target.value }))}
            />
            {type === "password" && (
                showPassword ? (
                    <i onClick={()=>{
                        setShowPassword((prev)=>!prev)
                    }} className="fi fi-rs-eye absolute top-1/2 -translate-y-1/2 right-4 mt-1 opacity-50 cursor-pointer"></i>
                ) : (
                    <i onClick={()=>{
                        setShowPassword((prev)=>!prev)
                    }} className="fi fi-sr-eye-crossed absolute top-1/2 -translate-y-1/2 right-4 mt-1 opacity-50 cursor-pointer"></i>
                )
            )}


        </div>
    )
}

export default Input
