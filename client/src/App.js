import React, { useState, useEffect } from 'react';

function App() {
  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/personas')
      .then(response => response.json())
      .then(data => setPersonas(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>List of Personas</h1>
      <ul>
        {personas.map((persona, index) => (
          <li key={index}>
            <strong>{persona.name}</strong> - {persona.platform}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;