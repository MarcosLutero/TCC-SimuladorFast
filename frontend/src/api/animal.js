import { Api } from "."

export function sortearAnimaisReq(qtd) {
    return Api.request("GET", `sortear-animais/${qtd}`, {})
}


export function listarAnimaisReq() {
    return Api.request("GET", `animal/`, {})
}
export function cadastrarAnimalReq(body) {
    return Api.request("POST", `animal/`, {body})
}
export function atualizarAnimalReq(id,body) {
    return Api.request("PUT", `animal/${id}`, { body })
}
export function deletarAnimalReq(id) {
    return Api.request("DELETE", `animal/${id}`, {})
}

export function listarImagensAnimalReq(idAnimal) {
    return Api.request("GET", `animal/${idAnimal}/imagens`, {})
}
export function cadastrarImagemAnimalReq(idAnimal, body) {
    return Api.request("POST", `animal/${idAnimal}/imagens`, {body, stringfyBody: false, contentType: ""})
}
export function atualizarImagemAnimalReq(idAnimal, idImagem, body) {
    return Api.request("PUT", `animal/${idAnimal}/imagens/${idImagem}`, {body, stringfyBody: false,contentType: ""})
}

export function deletarImagemAnimalReq(idAnimal, idImagem) {
    return Api.request("DELETE", `animal/${idAnimal}/imagens/${idImagem}`, {})
}