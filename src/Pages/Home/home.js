import { getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebaseConnection';
import './home.css'
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc, updateDoc} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import Login from '../Login/login';

function Home() {

  //--------------------------------------------------------------

  // VARIAVEIS DE USUARIOS
  const [login, setLogin] = useState({})
  const [user, setUser] = useState(false)

  // VARIAVEIS DE TAREFAS
  const [tasks, setTasks] = useState([]);

  const [taskName, setTaskName] = useState('')
  const [catTask, setCatTask] = useState('')

  const [editName, setEditName] = useState('')
  const [editCat, setEditCat] = useState("")
  const [editID, setEditID] = useState()

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

  //FUNÇÃO PARA EDITAR TAREFA
  async function obterTarefa(id){

    const taskRef = doc(db, "tasks", id)

    await getDoc(taskRef)
    .then((doc) => {
      setEditName(doc.data().name)
      setEditCat(doc.data().categoria)
      setEditID(doc.id)
    })

       
  }
  async function editTask(){
    const docRef = doc(db, "tasks", editID)
    await updateDoc(docRef, {
      name: editName,
      categoria: editCat
    })
    .then(() => {
      alert("Taks atualizada com sucesso")
      setEditName('')
      setEditCat('')
      setEditID('')
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

  //FUNÇÃO PARA SAIR DA CONTA DE USUÁRIO
  async function logout(){
    await signOut(auth)
    setUser(false)
  }

  return (
    <div className="App">


      <div className='container'>

        

        {user ? (
          <div className='containerList'>

            <div className='containerIdUser'>
              {user && (
                <div className='idUser'>
                  <div>
                  {user ? <h3>Usuário:</h3> : undefined}
                    <span>{login.email}</span>
                  </div>
                    <button onClick={logout}>Sair</button>

                </div>
              )}
            </div>

            <div className='containerListTasks'>
              <h1>Lista de Tarefas</h1>

              <div className='inputSearch'>
                <h3>Pesquisar:</h3>
                <input type="text" placeholder='Digite para pesquisar' onChange={(e) => searchTasks(e.target.value)} />
              </div>

              <div className='inputFilter'>
                <h3>Filtrar:</h3>
                <div className='filtros'>
                  <div className='Status'>
                    <label className='label'>Status:</label>
                    <select onChange={(e) => handleChange(e.target.value)}>
                      <option value="">Todos</option>
                      <option value="feito">Concluídos</option>
                      <option value="Nfeito">Não Concluídos</option>
                    </select>
                  </div>

                  <div className='OrdemAlfa'>
                    <label className='label'>Ordem alfabética</label>
                    <div>
                      <button onClick={ascOrder}>Asc</button>
                      <button onClick={dscOrder}>Desc</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className='listTasks'>
                <ul>

                  {tasksFiltered.map((task) => {
                    return (
                      <li key={task.id}>
                        <div className='liText'>
                          {task.status ? <span className='name marcado'>{task.name}</span> : <span className='name'>{task.name}</span> }
                          
                          <span className='cat'>({task.categoria})</span>
                        </div>

                        <div className='liBtn'>
                          {task.status ? (
                            <button className='btnDesmarcar' onClick={() => concluirTask(task.id, task.status)}>Desmarcar</button>
                          ) : (
                            <button className='btnConcluir' onClick={() => concluirTask(task.id, task.status)}>Concluir</button>
                          )}
                          <button className='btnEdit' onClick={() => obterTarefa(task.id)}>Editar</button>
                          <button className='btnExcluir' onClick={() => deleteTask(task.id)}>X</button>
                        </div>
                      </li>

                    )
                  })}
                </ul>
              </div>

              <div className='criarTarefa'>
                <h2>Editar tarefa:</h2>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} type='text' placeholder='Digite o titulo' />
                <select value={editCat} onChange={(e) => setEditCat(e.target.value)}>
                  <option value={""}>Selecione uma categoria</option>
                  <option>Trabalho</option>
                  <option>Estudos</option>
                  <option>Pessoal</option>
                </select>
                <button onClick={() => editTask()}>Editar tarefa</button>
              </div><hr/>
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


          </div>
        ) : <Login/>}

      </div>


    </div>
  );
}

export default Home;
