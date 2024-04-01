import React, { useState } from 'react';
import { cadastrarUsuarioReq } from '../api/usuarios';
import { auth } from '../api/auth';
import { Link } from 'react-router-dom';
const Cadastro = () => {
  const [nome, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorFeedback, setErrorFeedback] = useState('')

  function handleLogin() {
    setErrorFeedback("")
    cadastrarUsuarioReq({ nome, email, password })
      .then((createResp) => {
        auth(email, password)
          .then((resp) => {
            const usuario = {
              id: resp.usuario.id,
              email: resp.usuario.email,
              nome: resp.usuario.nome,
            }
            sessionStorage.setItem('access', resp.accessToken)
            sessionStorage.setItem("usuario", JSON.stringify(usuario))
            sessionStorage.setItem("nivelAcesso", 1)
            window.location.href = "/"
          })
          .catch(e => {
            sessionStorage.removeItem("access")
            setErrorFeedback("Email e/ou senha inválidos!")
          })
      })
      .catch(e => {
        console.log(e)
        setErrorFeedback(e.msg)
      })
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
                <h3 className="text-center">Cadastrar</h3>
              </div>
              <div className="card-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="nome" className="form-label">
                      Nome*:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nome"
                      value={nome}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email*:
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
                      Senha*:
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {errorFeedback ? <div className='text-danger pt-1'>{errorFeedback}</div> : <div />}
                  </div>
                  <div className="d-grid">
                    <button
                      type="button"
                      disabled={!nome.length || email.length < 6 || password.length < 4}
                      className="btn btn-primary"
                      onClick={handleLogin}
                    >
                      Cadastrar
                    </button>
                  </div>
                  <div className="text-center m-3">
                    <Link to='/login'>Acessar minha Conta</Link>
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

export default Cadastro;
