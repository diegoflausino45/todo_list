import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from "./Pages/Home/home"
import Sign from './Pages/Sign/sign'


function RouterApp(){
    return(
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/sign' element={<Sign/>}/>
        </Routes>
    </BrowserRouter>
    )
}


export default RouterApp