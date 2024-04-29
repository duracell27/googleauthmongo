import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <div className='flex justify-center items-center h-screen'>
      <div class="bg-green-500">
      <h1 className='text-4xl text-center'>Login</h1>
        <form className='flex flex-col gap-3 p-3'>
          <input className='p-1' name='' type="text" placeholder='Email'/>
          <input className='p-1' name='' type="text" placeholder='Password'/>
          <button type='button'>Login</button>
          <p>
            <Link to={'/'}>Not registred</Link></p>
        </form>
        <div class="">

        <button className='bg-white rounded p-1 block mx-auto mb-3'>Login with Google</button>
        </div>
      </div>

    </div>
  )
}

export default Login