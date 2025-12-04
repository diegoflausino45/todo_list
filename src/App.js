import { onSnapshot } from 'firebase/firestore';
import './App.css';
import { db, auth} from './firebaseConnection';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, updateDoc} from 'firebase/firestore';
import { useState, useEffect } from 'react';

function App() {

  //--------------------------------------------------------------

  // VARIAVEIS DE USUARIOS
  
  const [login, setLogin] = useState({})
  const [user, setUser] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  // VARIAVEIS DE TAREFAS
  const [tasks, setTasks] = useState([]);

  const [taskName, setTaskName] = useState('')
  const [catTask, setCatTask] = useState('')

  const [tasksFiltered, setTasksFiltered] = useState([])

  //FUNÇÃO PARA MONITORAR ESTADO DO USUÁRIO
  useEffect(() => {
    async function checkLogin(){
      onAuthStateChanged(auth, (user) => {
        if(user){
          setUser(true)
          setLogin({
            email: user.email,
            id: user.uid,
          })
        }else{
          setUser(false)
          setLogin({})
        }
      })
    }
    checkLogin()
  }, [])


  //FUNÇÃO PARA CARREGAR AS TAREFAS DIRETO DO BANCO
  useEffect(() => {
  
    async function loadTasks() {
      if(!user){
        setTasksFiltered([])
        return
      } 
      const usb = onSnapshot(collection(db,'tasks'), (snapshot) => {
      let tasksList = [];

      snapshot.forEach((doc) => {
        tasksList.push({
          id: doc.id,
          name: doc.data().name,
          categoria: doc.data().categoria,
          uid: doc.data().uid,
          status: doc.data().status,  
        });
      });

      const taskUsuario = tasksList.filter((task) => task.uid === login.id)
      setTasks(taskUsuario);
      setTasksFiltered(taskUsuario)
    });
    }
    loadTasks();
  }, [user]);


  //FUNÇÕES DE TAREFAS

  //FUNÇÃO PARA ADICIONAR TAREFA
  async function addTask(name, categoria) {


    if(!name ||name === undefined || name.trim() === ''){
      alert("Preencha o campo de titulo da task")
      return
    }

    if(categoria === '' || categoria === undefined){
      alert('Preencha o campo categoria para prosseguir')
      return
    }

    await addDoc(collection(db, "tasks"), {
      name: name,
      status: false,
      categoria: categoria,
      uid: login.id,
    })

    setCatTask('')
    setTaskName('')
  }

  //FUNÇÃO PARA CONCLUIR TAREFA 
  async function concluirTask(id, status){
      await updateDoc(doc(db, "tasks", id), {
        status: !status,
      })

  }

  //FUNÇÃO PARA DELETAR TAREFA
  async function deleteTask(id){
    await deleteDoc(doc(db, "tasks", id))
    .then(() => {
      alert("Task excluida com sucesso")
    })
    .catch(() => {
      alert("Erro")
    })
  }

  //FUNÇÃO PARA FILTRAR PELA BARRA DE PESQUISA
  function searchTasks(text){

    const valor = text.toLowerCase()

    const filter = tasks.filter((task) => task.name.toLowerCase().includes(valor))
    setTasksFiltered(filter)

  }

  //FUNÇÃO PARA FILTRAR POR TAREFAS CONCLUIDAS
  function handleChange(option){
    if(option === "feito"){
      console.log("FEITO")
      const filterFeito = tasks.filter((task) => task.status === true)
      setTasksFiltered(filterFeito)
      return
    }

    if(option === "Nfeito"){
      console.log("Não feito")
      const NfilterFeito = tasks.filter((task) => task.status === false)
      setTasksFiltered(NfilterFeito)
      return
    }

    setTasksFiltered(tasks)
  }

  //FUNÇÕES DE ORDEM (CRESCENTE E DECRESCENTE)
  function ascOrder(){
    const taskAsc = [...tasksFiltered].sort((a, b) => a.name.localeCompare(b.name))     
    setTasksFiltered(taskAsc)
  }

  function dscOrder(){
    const taskDsc = [...tasksFiltered].sort((a, b) => b.name.localeCompare(a.name))
    setTasksFiltered(taskDsc)
  }

  //------------------------------------------------------------------
  //FUNÇÔES USUARIOS

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

  //FUNÇÃO PARA SAIR DA CONTA DE USUÁRIO
  async function logout(){
    await signOut(auth)
    setUser(false)
  }

  return (
    <div className="App">

    <div className='containerUser'>

        {user ? <h3>Usuário Logado</h3> : <h3>Fazer Login</h3>}

        {user ? undefined : (
        <div className='sign'>
          <form>
            <input type='email' placeholder='Digite o seu email' value={email} onChange={(e) => setEmail(e.target.value)}/>
            <input type='password' placeholder='Digite sua senha' value={senha} onChange={(e) => setSenha(e.target.value)}/>
          </form>
          <div className='btnSign'>
            <button onClick={signUser}>Login</button>
            <button onClick={createUser}>Cadastrar</button>
          </div>
        </div>
        )}
        {user && (
          <div className='idUser'>
            <p>EMAIL: {login.email}</p>
            <button onClick={logout}>Sair</button>
          </div>
        )}

    </div>

      <hr/>
      {user ? (
        <div className='container'>

        <h1>Todo List</h1>

        <div className='inputSearch'>
          <h3>Pesquisar:</h3>
          <input type="text"  placeholder='Digite para pesquisar' onChange={(e) => searchTasks(e.target.value)} />
        </div>

        <hr/>

        <div className='inputFilter'>
          <h3>Filtrar:</h3>

          <div className='Status'>  
            <label>Status:</label>
            <select onChange={(e) => handleChange(e.target.value)}>
              <option value="">Todos</option>
              <option value="feito">Concluídos</option>
              <option value="Nfeito">Não Concluídos</option>
            </select>
          </div>

          <div className='OrdemAlfa'>
            <button onClick={ascOrder}>Asc</button>
            <button onClick={dscOrder}>Dsc</button>
          </div>
        </div>

        <hr/>


        <div className='listTasks'>
          <ul>

            {tasksFiltered.map( (task) => {
              return( 
                <li key={task.id}>
                  <br/>
                  <div className='liText'>
                    <span>Titulo: {task.name}</span><br/>
                    <span>Categoria: {task.categoria}</span><br/>
                    <span>ID do usuário: {task.uid}</span>
                  </div>

                  <div className='liBtn'>
                    {task.status ? (
                      <button onClick={() => concluirTask(task.id, task.status)}>Desmarcar</button>
                    ) : (
                      <button onClick={() => concluirTask(task.id, task.status)}>Concluir</button>
                    )}
                    <button onClick={() => deleteTask(task.id)}>Excluir</button>
                  </div>
                </li>

              )
            })}
          </ul>
        </div>

        <hr/>

        <div className='criarTarefa'>
          <h2>Criar tarefa:</h2>
          <input value={taskName} onChange={(e) => setTaskName(e.target.value)} type='text' placeholder='Digite o titulo' />
          <select value={catTask} onChange={(e) => setCatTask(e.target.value)}>
            <option value={""}>Selecione uma categoria</option>
            <option>Trabalho</option>
            <option>Estudos</option>
            <option>Pessoal</option>
          </select>
          <button onClick={() => addTask(taskName, catTask)}>Criar tarefa</button>
        </div>

      </div>
      ) : undefined}
      
    </div>
  );
}

export default App;
