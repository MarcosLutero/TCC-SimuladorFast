import React, { useState } from 'react';
import { auth } from '../api/auth';
import { Link } from 'react-router-dom';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorFeedback, setErrorFeedback] = useState('')

  async function handleLogin() {
    setErrorFeedback("")
    auth(email, password)
      .then(async (resp) => {

        const usuario = {
          id: resp.usuario.id,
          email: resp.usuario.email,
          nome: resp.usuario.nome,
        }
        sessionStorage.setItem('access', resp.accessToken)
        sessionStorage.setItem("usuario", JSON.stringify(usuario))

        let nivelAcesso = 0
        let goTo = "/"
        switch (resp.usuario.role) {
          case "ROLE_ADMIN":
            nivelAcesso = 3
            break;
          case "ROLE_TECNICO":
            nivelAcesso = 2
            break
          default:
            nivelAcesso = 1
            break
        }

        sessionStorage.setItem("nivelAcesso", nivelAcesso)


        window.location.href = goTo
      })
      .catch(e => {
        sessionStorage.removeItem("access")
        setErrorFeedback("Email e/ou senha inválidos!")
      })
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin()
    }
  };

  return (
    <div className='d-flex align-items-center' style={{ width: '100%', height: '100vh', backgroundColor: 'black', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card px-3" style={{borderRadius: '30px'}}>
              <div className="card-header">
                <div className='titulo text-dark'>
                  <h1>
                    Simulador de Exame A-FAST
                  </h1>
                </div>
                <h3 className="text-center">Login</h3>
              </div>
              <div className="card-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Senha:
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errorFeedback ? <div className='text-danger pt-1'>{errorFeedback}</div> : <div />}
                  </div>
                  <div className="d-grid">
                    <button
                      disabled={!email.length || !password.length}
                      type="button"
                      className="btn btn-primary"
                      onClick={handleLogin}
                    >
                      Entrar
                    </button>
                  </div>
                  <div className="text-center m-3">
                    <Link to='/cadastro'>Criar minha Conta</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
