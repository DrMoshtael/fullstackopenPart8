import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const SetBirth = ({ authors }) => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const [editYear] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(name, born)
    editYear({
      variables: {
        name: name,
        year: Number(born),
      },
    });
    setName("");
    setBorn("");
  };

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={handleSubmit}>
        <select value={name} onChange={e => setName(e.target.value)}>
            {authors.map(a => 
                <option key={a.name} value={a.name}>{a.name}</option>)}
        </select>
        <div>
          <label htmlFor="born">born</label>
          <input
            id="born"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default SetBirth;
