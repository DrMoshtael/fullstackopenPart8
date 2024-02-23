import { ALL_BOOKS, ME } from "../queries"
import { useQuery } from "@apollo/client"

const Recommend = () => {
    const meResult = useQuery(ME)
    const allBooksResult = useQuery(ALL_BOOKS)

    if (allBooksResult.loading || meResult.loading) {
        console.log('loading ME query',meResult)
        console.log('loading ALL_BOOKS query', allBooksResult)
        return <div>loading...</div>}
    console.log('finished loading ME query',meResult)
    console.log('finished loading ALL_BOOKS query',allBooksResult)
    const books = allBooksResult.data.allBooks
    const genre = meResult.data.me.favoriteGenre
  
    return (
      <div>
        <h2>recommendations</h2>
        <p>books in your favourite genre <strong>{genre}</strong></p>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {books
            .filter(b => b.genres.includes(genre))
            .map(b => (
              <tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  export default Recommend