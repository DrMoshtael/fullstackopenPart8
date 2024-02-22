import { useState } from "react";
import { CREATE_AUTHOR, ALL_AUTHORS } from "../queries";
import { useMutation } from "@apollo/client";

const NewAuthor = () => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  const [ createAuthor ] = useMutation(CREATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const submit = (event) => {
    event.preventDefault();
    console.log(name, Number(born));
    createAuthor({ variables: {
        name: name,
        born: Number(born)
    }})
    setName('')
    setBorn('')
  };

  return (
    <div>
      <h3>Add author</h3>
      <form onSubmit={submit}>
        <div>
          name
          <input value={name} onChange={({ target }) => setName(target.value)} />
        </div>
        <div>
            born
            <input value={born} type='number' onChange={({target}) => setBorn(target.value)} />
        </div>
        <button type='submit'>add author</button>
      </form>
    </div>
  );
};

export default NewAuthor