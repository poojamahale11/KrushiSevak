import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LogIn, AlertCircle, KeyRound, Mail, Sprout, ShoppingBasket, Store } from 'lucide-react';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ROLES = [
  {
    value: 'farmer',
    icon: Sprout,
    color: '#2d6a4f',
  },
  {
    value: 'customer',
    icon: ShoppingBasket,
    color: '#2563eb',
  },
  {
    value: 'storeOwner',
    icon: Store,
    color: '#b45309',
  },
];

export const Login = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');
  const safeInitialRole = ROLES.some((r) => r.value === initialRole) ? initialRole : 'farmer';

  const [role, setRole] = useState(safeInitialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password, role);
      const targetPath =
        from && from !== '/login' && from !== '/register'
          ? from
          : getRoleDashboardPath(user.role);

      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRole = ROLES.find((item) => item.value === role) || ROLES[0];
  const SelectedIcon = selectedRole.icon;

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div
            style={{
              width: 52,
              height: 52,
              margin: '0 auto 0.75rem',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              background: `${selectedRole.color}15`,
              color: selectedRole.color,
            }}
          >
            <SelectedIcon size={27} />
          </div>
          <h2>{t('loginTitle')}</h2>
          <p>{t('loginSubtitle')}</p>
        </div>

        {/* Separate role login selection for every user type */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: '0.65rem',
            }}
          >
            {t('role')}
          </div>

          <div
            className="role-tabs"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.6rem',
            }}
          >
            {ROLES.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className={`role-tab-btn ${role === value ? 'active' : ''}`}
                onClick={() => handleRoleChange(value)}
                aria-pressed={role === value}
              >
                <Icon size={18} />
                <span>{t(value)}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">
              <span>{t('email')}</span>
              <Mail size={16} style={{ color: 'var(--text-muted)' }} />
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">
              <span>{t('password')}</span>
              <KeyRound size={16} style={{ color: 'var(--text-muted)' }} />
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting}
          >
            <LogIn size={18} />
            <span>
              {submitting
                ? t('loading')
                : `${t('loginBtn')} - ${t(role)}`}
            </span>
          </button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.92rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>{t('noAccount')} </span>
          <Link to={`/register?role=${role}`} style={{ fontWeight: 700 }}>
            {t('registerHere')} ({t(role)})
          </Link>
        </div>

        <div
          style={{
            marginTop: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-soft, #f5f8f5)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          New user? Choose your role above, register, then sign in with your
          own account. Demo accounts are optional and are not required.
        </div>
      </div>
    </div>
  );
};
