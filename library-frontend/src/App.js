import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notify from './components/Notify'
import { useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom'

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }


  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <Router>
        <div>
          <Link to='/'><button>authors</button></Link>
          <Link to='/books'><button>books</button></Link>
          <Link to='/add'><button>add book</button></Link>
        </div>
        <Routes>
          <Route path='/' element={<Authors />} />
          <Route path='/books' element={<Books />} />
          <Route path='/add' element={<NewBook notify={notify}/>} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
