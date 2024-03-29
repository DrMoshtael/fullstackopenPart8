import { ALL_BOOKS, SOME_BOOKS } from "../queries"
import { useQuery } from "@apollo/client"

const Books = ({genre, setGenre}) => {

  const allBooksResult = useQuery(ALL_BOOKS)
  const someBooksResult = useQuery(SOME_BOOKS, { variables: { genre: genre }})

  if (allBooksResult.loading || someBooksResult.loading) {
    console.log('loading',someBooksResult)
    return <div>loading...</div>}
  console.log('unloaded',someBooksResult)

  const books = allBooksResult.data.allBooks
  const someBooks = someBooksResult.data.allBooks
  const genres = [...new Set(books.flatMap( b => b.genres ))]

  return (
    <div>
      <h2>books</h2>
      <p>in genre <strong>{genre==='' ? 'all genres' : genre}</strong></p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {
          // books
          // .filter(b => genre === 'all genres' || b.genres.includes(genre))
          someBooks
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
      <button onClick={() => setGenre('')}>all genres</button>
    </div>
  )
}

export default Books
