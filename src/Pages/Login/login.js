import { auth } from '../../firebaseConnection';
import './loginsing.css'
import { signInWithEmailAndPassword} from 'firebase/auth';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {

  //--------------------------------------------------------------

  // VARIAVEIS DE USUARIOS
  const [login, setLogin] = useState({})
  const [user, setUser] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')


  //FUNÇÃO PARA LOGAR USUÁRIO
  async function signUser(){

    await signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      setLogin({
        email: userCredential.user.email,
        id: userCredential.user.uid,
      })
      setUser(true)
      setEmail('')
      setSenha('')
    })
    .catch((error) => {
        alert("Erro:" + error)
      })

  }


  return (
      <div className='container'>

        <div className='containerUser'>

          {user ? undefined : (
            <div className='containerSign'>
              <div className='sign'>
                {user ? undefined : <h3>Login</h3>}

                <form>
                  <label>Seu e-mail</label>
                  <input type='email' placeholder='seuemail@email.com' value={email} onChange={(e) => setEmail(e.target.value)} />
                  <label>Sua senha</label>
                  <input type='password' placeholder='1234...' value={senha} onChange={(e) => setSenha(e.target.value)} />
                </form>
                <div className='btnSign'>
                  <button className='btnLogin' onClick={signUser}>Logar</button>
                </div>
              </div>
              <div className='rodape'>
                <span>Ainda não tem uma conta? </span>
                <Link to={`/sign`}><button className='btnCreate'>Cadastre-se</button></Link>
              </div>
            </div>
          )}
          

        </div>

      </div>
  );
}

export default Login;
