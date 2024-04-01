import { Api } from "."

export function auth(email, pwd) {
    return Api.request("POST", "auth/login", {body: {email, password: pwd}, hasToken: false})
}

export function getUsuario() {
    return Api.request("GET", "usuario", {})
}