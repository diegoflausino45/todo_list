import { onSnapshot } from 'firebase/firestore';
import './App.css';
import { db, auth } from './firebaseConnection';
import { collection, addDoc, deleteDoc, doc, updateDoc} from 'firebase/firestore';
import { useState, useEffect } from 'react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('')
  const [catTask, setCatTask] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [tasksFiltered, setTasksFiltered] = useState([])


  useEffect(() => {
  
    async function loadTasks() {
      const usb = onSnapshot(collection(db,'tasks'), (snapshot) => {
      let tasksList = [];

      snapshot.forEach((doc) => {
        tasksList.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setTasks(tasksList);
      setTasksFiltered(tasksList)
    });
    }
    loadTasks();
  }, []);

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
    })

    setCatTask('')
    setTaskName('')
  }

  async function concluirTask(id, status){
      await updateDoc(doc(db, "tasks", id), {
        status: !status,
      })
  }


  async function deleteTask(id){
    await deleteDoc(doc(db, "tasks", id))
    .then(() => {
      alert("Task excluida com sucesso")
    })
    .catch(() => {
      alert("Erro")
    })
  }

  function searchTasks(text){

    const valor = text.toLowerCase()
    setPesquisa(valor)

    const filter = tasks.filter((task) => task.name.toLowerCase().includes(valor))
    setTasksFiltered(filter)

  }

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

  function ascOrder(){
    const taskAsc = [...tasks].sort((a, b) => a.name.localeCompare(b.name))     
    setTasksFiltered(taskAsc)
  }

  function dscOrder(){
    const taskDsc = [...tasks].sort((a, b) => b.name.localeCompare(a.name))
    setTasksFiltered(taskDsc)
  }

  return (
    <div className="App">
      
      <div className='container'>

        <h1>Todo List</h1>

        <div className='inputSearch'>
          <h3>Pesquisar:</h3>
          <input type="text" value={pesquisa} placeholder='Digite para pesquisar' onChange={(e) => searchTasks(e.target.value)} />
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

                  <div className='liText'>
                    <span>{task.name}</span><br/>
                    <span>{task.categoria}</span>
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
    </div>
  );
}

export default App;
