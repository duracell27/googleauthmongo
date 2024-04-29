import React from 'react'
import { NavLink } from 'react-router-dom'

const Headers = () => {
  return (
    <header>
      <nav class="flex justify-between p-2 bg-green-600 text-white">

        <h1>LandOwer</h1>
        <ul className='flex gap-2 items-center'>
          <li className='p-2 rounded-md bg-green-700'><NavLink to={'/'}>Home</NavLink></li>
          <li className='p-2 rounded-md bg-green-700'><NavLink to={'/login'}>Login</NavLink></li>
          <li className='p-2 rounded-md bg-green-700'><NavLink to={'/dashboard'}>Dashboard</NavLink></li>
        </ul>
      </nav>
    </header>
  )
}

export default Headers