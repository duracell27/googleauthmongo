import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const Profile = () => {
  return (
    <div >
      <div className="flex justify-center gap-4 text-white bg-green-800 p-2">
        <NavLink className='p-1 rounded-lg shadow-xl px-3 bg-green-700 text-xl font-bold' to={'friends'}>Друзі</NavLink>
        <NavLink className='p-1 rounded-lg shadow-xl px-3 bg-green-700 text-xl font-bold' to={'groups'}>Групи</NavLink>
        <NavLink className='p-1 rounded-lg shadow-xl px-3 bg-green-700 text-xl font-bold' to={'expense'}>Додати витрату</NavLink>
        <NavLink className='p-1 rounded-lg shadow-xl px-3 bg-green-700 text-xl font-bold' to={'account'}>Акаунт</NavLink>
      </div>
      <div className="bg-green-600 p-2 text-white">

      <Outlet />
      </div>
    </div>
  )
}

export default Profile