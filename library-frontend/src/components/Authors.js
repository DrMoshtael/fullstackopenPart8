import { ALL_AUTHORS } from "../queries"
import { useQuery } from "@apollo/client"
import SetBirth from "./SetBirth"

const Authors = (props) => {

  const allAuthResult = useQuery(ALL_AUTHORS)

  if (allAuthResult.loading) return <div>loading...</div>

  const authors = allAuthResult.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SetBirth authors={authors} />
    </div>
  )
}

export default Authors
