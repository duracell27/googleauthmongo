import React from 'react'

const Home = () => {
  return (
    <div className='h-screen bg-green-500 flex flex-col gap-10 items-center text-white' >
        <div className="p-2 m-2 shadow-lg shadow-black/30 text-lg font-bold bg-green-600 text-center rounded-lg">Привіт, ми допоможемо тобі розрахувати всі твої борги</div>
        <div className="p-2 m-2 shadow-lg shadow-black/30 text-lg font-bold bg-green-600 text-center rounded-lg">Ми вже розрахували 15 000 грн</div>
        <div className="p-2 m-2 shadow-lg shadow-black/30 text-lg font-bold bg-green-600 text-center rounded-lg">Версія - <span className='bg-slate-800 rounded-lg mb-2 px-1'>0.07</span>
        <div className="text-left mt-2">

        <p className='bg-slate-800 rounded-lg mb-2 px-1 font-light'><span>0.07</span> - створення витрати, розподіл тих хто платив</p>
        <p className='bg-slate-800 rounded-lg mb-2 px-1 font-light'><span>0.06</span> - видалення груп, якщо ти перший учасник, або єдини, додавання користувачів, видалення</p>
        <p className='bg-slate-800 rounded-lg mb-2 px-1 font-light'><span>0.05</span> - створення груп, та аватарів груп</p>
        <p className='bg-slate-800 rounded-lg mb-2 px-1 font-light'><span>0.04</span> - зберігання стандартної валюти, мови, банківської карти</p>
        <p className='bg-slate-800 rounded-lg mb-2 px-1 font-light'><span>0.03</span> - додано пошук друзів</p>
        <p className='bg-slate-800 rounded-lg mb-2 px-1 font-light'><span>0.02</span> - додано список друзів та запитів друзів</p>
        <p className='bg-slate-800 rounded-lg mb-2 px-1 font-light'><span>0.01</span> - додано авторизацію користувачів</p>
        </div>
        </div>
    </div>
  )
}

export default Home