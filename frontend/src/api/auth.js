import { Api } from "."

export function auth(email, pwd) {
    return Api.request("POST", "auth/login", {body: {email, password: pwd}, hasToken: false})
}

// DEPRECATED: endpoint GET /usuario não existe no backend (404). Use sessionStorage.getItem('usuario').
// Mantido para compatibilidade, mas não deve ser usado. Se necessário, implementar GET /usuarios/me no backend.
export function getUsuario() {
    return Promise.reject({ msg: 'Endpoint GET /usuario não implementado', status: 501 });
}