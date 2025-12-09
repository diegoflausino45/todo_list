import { auth } from '../../firebaseConnection';
import '../Login/loginsing.css'
import {createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Sign() {

  //--------------------------------------------------------------

  // VARIAVEIS DE USUARIOS
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')


  //FUNÇÃO PARA CADASTRAR USUÁRIO
  async function createUser(){
    await createUserWithEmailAndPassword(auth, email, senha)
    .then(() => {
      alert("Usuário criado com sucesso")
      setEmail('')
      setSenha('')
    })
    .catch((error) => {
      if(error.code === 'auth/weak-password'){
        alert("Senha muito fraca")
      }else if(error.code === "auth/email-already-in-use"){
        alert("Email já em uso!")
      }
    })
  }

  return (
    <div className="App">


      <div className='container'>

        <div className='containerUser'>

            <div className='containerSign'>
              <div className='sign'>
                <h3>Sign</h3>

                <form>
                  <label>Seu e-mail</label>
                  <input type='email' placeholder='seuemail@email.com' value={email} onChange={(e) => setEmail(e.target.value)} />
                  <label>Sua senha</label>
                  <input type='password' placeholder='1234...' value={senha} onChange={(e) => setSenha(e.target.value)} />
                </form>
                <div className='btnSign'>
                  <button className='btnLogin' onClick={createUser}>Cadastrar</button>
                </div>
              </div>
              <div className='rodape'>
                <span>Já tem uma conta? </span>
                <Link to={"/"}><button className='btnCreate'>Faça Login</button></Link>
              </div>
            </div>
          

        </div>

      </div>


    </div>
  );
}

export default Sign;
