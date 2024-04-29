import { Route, Routes } from 'react-router-dom'
import Home from './Componets/Home'
import Login from './Componets/Login'
import Dashboard from './Componets/Dashboard'
import Error from './Componets/Error'
import Headers from './Componets/Headers'

function App() {
  return (
    <>
    <Headers/>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='*' element={<Error/>}/>
    </Routes>
    </>
  );
}

export default App;
