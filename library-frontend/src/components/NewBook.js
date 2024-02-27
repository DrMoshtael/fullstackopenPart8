import { useState } from 'react'
import { ADD_BOOK, ALL_AUTHORS, ALL_BOOKS, SOME_BOOKS } from '../queries'
import { useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

const NewBook = ({notify, genreFilter}) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const navigate = useNavigate()

  const [ createBook ] = useMutation(ADD_BOOK
    , {
    // refetchQueries: [ { query: ALL_BOOKS }, { query: ALL_AUTHORS }, { query: SOME_BOOKS }],
    refetchQueries: [
      { query: ALL_BOOKS },
      { query: ALL_AUTHORS },
      { query: SOME_BOOKS },
      { query: SOME_BOOKS, variables: { genre: genreFilter }}
    ],
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      notify(messages)
    },
    // update(cache, response) {
    //   cache.updateQuery({ query: SOME_BOOKS }, ({ cachedSomeBooks }) => {
    //     console.log('cahcedboks',cachedSomeBooks)
    //     return {
    //       cachedSomeBooks: cachedSomeBooks.concat(response.data.allBooks),
    //     }
    //   })
    // }
  })

  const submit = (event) => {
    event.preventDefault()
    createBook({ variables: { 
      title: title, 
      author: author, 
      published: Number(published), 
      genres: genres 
    }})

    navigate('/books')
    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook