import React from 'react'

const Home = () => {
  return (
    <div className='h-screen bg-green-500 flex flex-col gap-10 items-center text-white' >
        <div className="p-2 m-2 shadow-lg shadow-black/30 text-lg font-bold bg-green-600 text-center rounded-lg">Привіт, ми допоможемо тобі розрахувати всі твої борги</div>
        <div className="p-2 m-2 shadow-lg shadow-black/30 text-lg font-bold bg-green-600 text-center rounded-lg">Версія <span>0.01</span></div>
        <div className="p-2 m-2 shadow-lg shadow-black/30 text-lg font-bold bg-green-600 text-center rounded-lg">Ми вже розрахували 15 000 грн</div>
    </div>
  )
}

export default Home