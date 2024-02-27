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
import { ALL_BOOKS, SOME_BOOKS } from './queries'

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const navigate = useNavigate()
  const [genreFilter, setGenreFilter] = useState('')

  useEffect(() => {
    const toke = localStorage.getItem('library-user-token')
    if (toke) setToken(toke)
  }, [])

  /*  Although the 'all genres' list was updating with only the refetchQueries,
  the individual genres were not. I suspect it was because it only updated particular
  genre queries and not all of them. Therefore I've added this so that queries are 
  updated when the genre changes, not only when a new book is added. 
 */
  useEffect( () => { 
    console.log('queries update')
    client.refetchQueries({ include: [
      { query: ALL_BOOKS },
      { query: SOME_BOOKS, variables: { genre: genreFilter }}
    ] })
  }, [genreFilter])

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
          <Route path='/books' element={<Books genre={genreFilter} setGenre={setGenreFilter} />} />
          <Route path='/add' element={<NewBook notify={notify} genreFilter={genreFilter}/>} />
          <Route path='/login' element={<LoginForm setToken={setToken} />} />
          <Route path='/add_author' element={<NewAuthor />} />
          <Route path='/recommend' element={<Recommend />} />
        </Routes>
    </div>
  )
}

export default App
