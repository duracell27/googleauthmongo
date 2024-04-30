import { Route, Routes } from 'react-router-dom'
import Home from './Componets/Home'
import Login from './Componets/Login'
import Error from './Componets/Error'
import Headers from './Componets/Headers'
import Profile from './Componets/Profile'
import Friends from './Componets/Friends'
import Groups from './Componets/Groups'
import AddExpense from './Componets/AddExpense'
import Account from './Componets/Account'

function App() {
  return (
    <>
    <Headers/>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/profile' element={<Profile/>}>
        <Route path='friends' element={<Friends/>}/>
        <Route path='groups' element={<Groups/>}/>
        <Route path='addexpense' element={<AddExpense/>}/>
        <Route path='account' element={<Account/>}/>
      </Route>
      <Route path='*' element={<Error/>}/>
    </Routes>
    </>
  );
}

export default App;
