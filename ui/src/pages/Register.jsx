import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Dropdown from '../components/Dropdown';
import logo from '../assets/logo_login.png';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    companyId: ''
  });
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await authService.getCompaniesPublic();
        setCompanies(data || []);
      } catch (err) {
        console.error('Error loading companies:', err);
      }
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    if (companies.length > 0 && !formData.companyId) {
      setFormData(prev => ({ ...prev, companyId: companies[0].id }));
    }
  }, [companies, formData.companyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Паролите не съвпадат');
      return;
    }

    if (formData.password.length < 6) {
      setError('Паролата трябва да е поне 6 символа');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      const result = await register(userData);

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
        <h2>Регистрация</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Име и фамилия</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Въведете име и фамилия"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Потребителско име</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Въведете потребителско име"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Въведете email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Въведете телефон"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyId">Компания</label>
            <Dropdown
              id="companyId"
              name="companyId"
              value={formData.companyId}
              onChange={handleChange}
              required
              disabled={loading}
              options={companies.map(company => ({
                value: company.id,
                label: company.name
              }))}
              placeholder="Изберете компания"
              searchable={false}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Парола</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Въведете парола"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Потвърдете паролата</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Повторете паролата"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Зареждане...' : 'Регистрация'}
          </button>
        </form>

        <p className="auth-link">
          Имате акаунт? <Link to="/login">Влезте</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
