import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PaginaInicial, Quiz, AdminAnimais, Login, FeedbackPage, UsuariosPage, Cadastro } from "./pages";

function PrivateRoute({ element: Component, level }) {
  const [nivelAcesso, setNivelAcesso] = useState(null);

  useEffect(() => {
    const storedRaw = sessionStorage.getItem("nivelAcesso");
    const storedNivelAcesso = storedRaw !== null ? parseInt(storedRaw, 10) : null;
    // level 0 = páginas públicas (login/cadastro): se já logado, bloqueia e manda para home
    if (level === 0) {
      if (storedNivelAcesso !== null && !isNaN(storedNivelAcesso) && storedNivelAcesso > 0) {
        setNivelAcesso(1); // já logado → será < level? não, vamos marcar como 1 para redirecionar fora
      } else {
        setNivelAcesso(0);
      }
      return;
    }
    if (storedNivelAcesso === null || isNaN(storedNivelAcesso)) {
      setNivelAcesso(0);
    } else if (storedNivelAcesso < level) {
      setNivelAcesso(storedNivelAcesso === 0 ? 0 : 1);
    } else {
      setNivelAcesso(level);
    }
  }, [level]);

  if (nivelAcesso === null) {
    return null;
  }

  if (level === 0 && nivelAcesso > 0) {
    return <Navigate to="/" replace />;
  }

  if (nivelAcesso < level) {
    return <Navigate to={nivelAcesso === 0 ? "/login" : "/"} replace />;
  }

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
