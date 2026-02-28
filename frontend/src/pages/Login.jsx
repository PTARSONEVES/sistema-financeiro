import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext' // <-- IMPORTANTE
import ThemeToggle from '../components/ThemeToggle'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const { darkMode } = useTheme() // <-- PEGAR O ESTADO DO TEMA
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  // Estilos baseados no darkMode
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: darkMode ? '#1a202c' : '#f3f4f6', // Escuro: cinza escuro, Claro: cinza claro
      transition: 'background-color 0.3s ease'
    },
    card: {
      maxWidth: '400px',
      width: '100%',
      backgroundColor: darkMode ? '#2d3748' : '#ffffff', // Escuro: cinza médio, Claro: branco
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      color: darkMode ? '#f7fafc' : '#1a202c', // Escuro: branco, Claro: preto
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      color: darkMode ? '#cbd5e0' : '#4a5568', // Escuro: cinza claro, Claro: cinza médio
      marginBottom: '0.25rem'
    },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
      borderRadius: '4px',
      backgroundColor: darkMode ? '#1a202c' : '#ffffff',
      color: darkMode ? '#f7fafc' : '#1a202c',
      marginBottom: '1rem'
    },
    button: {
      width: '100%',
      padding: '0.5rem 1rem',
      backgroundColor: darkMode ? '#3182ce' : '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s ease'
    },
    link: {
      color: darkMode ? '#90cdf4' : '#2563eb',
      textDecoration: 'none'
    }
  }

  return (
    <div style={styles.container}>
      <ThemeToggle />
      
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>
        
        {error && (
          <div style={{
            backgroundColor: darkMode ? '#742a2a' : '#fee',
            color: darkMode ? '#feb2b2' : '#c00',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <div>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Entrar
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1rem', color: darkMode ? '#cbd5e0' : '#4a5568' }}>
          Não tem uma conta?{' '}
          <Link to="/register" style={styles.link}>
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  )
}