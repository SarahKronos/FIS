import React, { useState, useEffect } from 'react';
import './App.css';

// ERSETZE DIESE URL DURCH DEINE GOOGLE APPS SCRIPT URL!
const API_URL = "https://script.google.com/macros/s/AKfycbwT-eGLhhN69hkcmV-vYKJQu2hqVThPh9gEWlBw4d3qoqSht1OJ7Btd4EnH0q3sUz92/exec";

function App() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Funktion: Daten vom Google Sheet laden
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setLectures(data);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Funktion: Vorlesung löschen
  const handleDelete = async (id) => {
    const pin = prompt("Dozenten-PIN:");
    if (!pin) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ id: id, pin: pin }),
      });
      const result = await response.json();

      if (result.status === "success") {
        alert("Vorlesung gelöscht!");
        fetchData(); // Liste neu laden
      } else {
        alert("Fehler: " + result.message);
      }
    } catch (error) {
      alert("Schnittstellen-Fehler. Hast du die API korrekt veröffentlicht?");
    }
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Vorlesungsplan</h1>
      
      {loading ? (
        <p>Lade Plan...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4' }}>
                <th style={{ padding: '10px' }}>Event</th>
                <th style={{ padding: '10px' }}>Raum</th>
                <th style={{ padding: '10px' }}>Dozent</th>
                <th style={{ padding: '10px' }}>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {lectures.map((item) => (
                <tr key={item.ID}>
                  <td style={{ padding: '10px' }}>{item.Name}</td>
                  <td style={{ padding: '10px' }}>{item.Raum}</td>
                  <td style={{ padding: '10px' }}>{item.Dozent}</td>
                  <td style={{ padding: '10px' }}>
                    <button 
                      onClick={() => handleDelete(item.ID)}
                      style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;