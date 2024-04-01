import { Api } from "."

export function listarUsuariosReq() {
    return Api.request("GET", `admin/usuarios`, {})
}

export function promoverUsuarioReq(id) {
    return Api.request("POST", `admin/promover-usuario/${id}`, {})
}

export function cadastrarUsuarioReq(body) {
    return Api.request("POST", `usuarios`, {body})
}

