import React from 'react'
import { Link } from 'react-router-dom'

const Error = () => {
  return (
    <div className='bg-green-700 h-screen flex justify-center items-center'>
      <div className="blockEl flex flex-col gap-3 items-center bg-green-800">
        <h1 className='text-4xl text-white font-bold text-center'>Такої сторінки не існує</h1>
        <Link className='text-xl text-white bg-slate-800 p-2 rounded-xl'  to={'/'}>Повернутись на головну</Link>
      </div>
    </div>
  )
}

export default Error