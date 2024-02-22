import { useState } from "react"
import { ALL_BOOKS } from "../queries"
import { useQuery } from "@apollo/client"

const Books = (props) => {
  const [genre, setGenre] = useState('all genres')
  const allBooksResult = useQuery(ALL_BOOKS)

  if (allBooksResult.loading) return <div>loading...</div>

  const books = allBooksResult.data.allBooks
  const genres = [...new Set(books.flatMap( b => b.genres ))]

  return (
    <div>
      <h2>books</h2>
      <p>in genre <strong>{genre}</strong></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books
          .filter(b => genre === 'all genres' || b.genres.includes(genre))
          .map(b => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map(g => (
        <button key={g} onClick={() => setGenre(g)}>{g}</button>
      ))}
      <button onClick={() => setGenre('all genres')}>all genres</button>
    </div>
  )
}

export default Books
