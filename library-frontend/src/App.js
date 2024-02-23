import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notify from './components/Notify'
import LoginForm from './components/LoginForm'
import NewAuthor from './components/NewAuthor'
import Recommend from './components/Recommend'
import { useState, useEffect } from 'react'
import {
  Routes,
  Route,
  Link,
  useNavigate
} from 'react-router-dom'
import { useApolloClient } from '@apollo/client'

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const navigate = useNavigate()

  useEffect(() => {
    const toke = localStorage.getItem('library-user-token')
    if (toke) setToken(toke)
  }, [])

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const logout = () => {
    navigate('/login')
    setToken(null)
    localStorage.removeItem('library-user-token')
    client.clearStore()
  }

  return (
    <div>
      <Notify errorMessage={errorMessage} />
        <div>
          <Link to='/'><button>authors</button></Link>
          <Link to='/books'><button>books</button></Link>
          <Link to='/add_author'><button>add author</button></Link>
          {token && <Link to='/add'><button>add book</button></Link>}
          {!token && <Link to='/login'><button>login</button></Link>}
          {token && <Link to='/recommend'><button>recommend</button></Link>}
          {token && <button onClick={logout}>logout</button>}

        </div>
        <Routes>
          <Route path='/' element={<Authors />} />
          <Route path='/books' element={<Books />} />
          <Route path='/add' element={<NewBook notify={notify}/>} />
          <Route path='/login' element={<LoginForm setToken={setToken} />} />
          <Route path='/add_author' element={<NewAuthor />} />
          <Route path='/recommend' element={<Recommend />} />
        </Routes>
    </div>
  )
}

export default App
