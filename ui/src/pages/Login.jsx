import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo_login.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Грешка при свързване със сървъра');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="Logo" className="auth-logo" />
        <h2>Вход в системата</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Потребителско име</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Въведете потребителско име"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Парола</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Въведете парола"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Зареждане...' : 'Вход'}
          </button>
        </form>

        <p className="auth-link">
          Нямате акаунт? <Link to="/register">Регистрирайте се</Link>
        </p>

        <div className="demo-credentials">
          <h4>Демо акаунти:</h4>
          <p><strong>Админ:</strong> admin / admin123</p>
          <p><strong>Служител:</strong> ivan.petrov / password123</p>
          <p><strong>Клиент:</strong> anna.v / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
