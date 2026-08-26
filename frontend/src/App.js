import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PaginaInicial, Quiz, AdminAnimais, Login, FeedbackPage, UsuariosPage, Cadastro } from "./pages";

function PrivateRoute({ element: Component, level }) {
  const [nivelAcesso, setNivelAcesso] = useState(null);

  useEffect(() => {
    const storedRaw = sessionStorage.getItem("nivelAcesso");
    const storedNivelAcesso = storedRaw !== null ? parseInt(storedRaw, 10) : null;
    if (storedNivelAcesso === null || isNaN(storedNivelAcesso)) {
      setNivelAcesso(0);
    } else if (storedNivelAcesso < level) {
      // Nível insuficiente: se já logado, vai para "/", se não logado, para "/login"
      setNivelAcesso(storedNivelAcesso === 0 ? 0 : 1);
    } else {
      setNivelAcesso(level);
    }
  }, [level]);

  if (nivelAcesso === null) {
    // Aguarde até que o nível de acesso seja determinado
    return null;
  }

  if (nivelAcesso < level) {
    // Redirecionar para a página de login ou página inicial, conforme necessário
    return <Navigate to={nivelAcesso === 0 ? "/login" : "/"} replace />;
  }

  // Renderizar o componente protegido
  return <Component />;
}

export default function App(props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PrivateRoute element={Login} level={0} />} />
        <Route path="/cadastro" element={<PrivateRoute element={Cadastro} level={0} />} />
        <Route path="/" element={<PrivateRoute element={PaginaInicial} level={1} />} />
        <Route path="/quiz" element={<PrivateRoute element={Quiz} level={1} />} />
        <Route path="/feedbacks" element={<PrivateRoute element={FeedbackPage} level={2} />} />
        <Route path="/animais" element={<PrivateRoute element={AdminAnimais} level={2} />} />
        <Route path="/admin/usuarios" element={<PrivateRoute element={UsuariosPage} level={3} />} />
      </Routes>
    </BrowserRouter>
  );
}
