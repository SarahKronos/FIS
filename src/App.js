import React, { useState, useEffect } from 'react';
import './App.css';

// GOOGLE APPS SCRIPT URL!
const API_URL = "https://script.google.com/macros/s/AKfycbwT-eGLhhN69hkcmV-vYKJQu2hqVThPh9gEWlBw4d3qoqSht1OJ7Btd4EnH0q3sUz92/exec";
function App() {
  const [events, setEvents] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPin, setCurrentPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setEvents(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- HIER IST DIE ZEITFORMATIERUNG ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; 
    return date.toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const handleLogin = () => {
    const pin = prompt("Dozenten-PIN eingeben:");
    if (!pin) return;
    const entry = events.find(e => String(e.Pin) === String(pin));
    if (entry) {
      setIsLoggedIn(true);
      setCurrentUser(entry.Lecturer);
      setCurrentPin(pin);
      alert(`Willkommen, ${entry.Lecturer}!`);
    } else { alert("Falscher PIN!"); }
  };

  const requestDelete = async (id) => {
    if (!window.confirm("Dieses Event wirklich löschen?")) return;
    await sendPost({ action: "delete", id, pin: currentPin });
    fetchData();
  };

  const requestUpdate = async (id, newLocation) => {
    await sendPost({ action: "update", id, pin: currentPin, newLocation });
    setEditingEvent(null);
    setTimeout(fetchData, 1000); 
  };

  const sendPost = async (body) => {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(body)
    });
    alert("Anfrage an Server gesendet!");
  };

  const uniqueFields = [...new Set(events.map(item => item.FieldOfStudy))].filter(Boolean).sort();

  const renderColumn = (fieldValue) => {
    const filtered = events.filter(e => {
      const matchesField = e.FieldOfStudy === fieldValue;
      return isLoggedIn ? (matchesField && e.Lecturer === currentUser) : matchesField;
    });

    return (
      <div className="column" key={fieldValue}>
        <h2>{fieldValue}</h2>
        <div className="event-list">
          {filtered.map(e => (
            <div key={e.ID} className="event-card">
              <div className="event-header">
                <strong>{e.Title}</strong>
                <span className="time-tag">{e.Time}</span>
              </div>
              <p className="event-desc">{e.Description}</p>
              <div className="event-details">
                <span>📍 {e.Location}</span>
                <span>👤 {e.Lecturer}</span>
                {/* HIER WIRD DIE FORMATIERUNG ANGEWENDET */}
                <span>📅 {formatDate(e.Day)}</span> 
              </div>
              {isLoggedIn && (
                <div className="admin-btns">
                  <button className="edit-btn" onClick={() => setEditingEvent(e)}>Ändern</button>
                  <button className="delete-btn" onClick={() => requestDelete(e.ID)}>Löschen</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-content">
          <h1>Information System</h1>
          <div className="auth-box">
            {isLoggedIn ? (
              <div className="user-info">
                <span>Dozent: <strong>{currentUser}</strong></span>
                <button className="login-btn logout" onClick={() => setIsLoggedIn(false)}>Logout</button>
              </div>
            ) : (
              <button className="login-btn" onClick={handleLogin}>Lecturer Login</button>
            )}
          </div>
        </div>
      </header>

      {loading ? <div className="loader">Lade Plan...</div> : (
        <main className="grid-layout">
          {uniqueFields.map(field => renderColumn(field))}
        </main>
      )}

      {/* --- BEARBEITEN MODAL --- */}
      {editingEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Location ändern</h3>
            <p>{editingEvent.Title}</p>
            <input id="newLocInput" defaultValue={editingEvent.Location} autoFocus />
            <div className="modal-btns">
              <button className="save-btn" onClick={() => requestUpdate(editingEvent.ID, document.getElementById('newLocInput').value)}>Speichern</button>
              <button className="cancel-btn" onClick={() => setEditingEvent(null)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;