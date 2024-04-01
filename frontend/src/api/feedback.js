import { Api } from "."

export function listarFeedbacksReq(id='') {
    console.log("a  ",id)
    return Api.request("GET", `feedbacks/${id}`, {})
}

export function cadastrarFeedbackReq(body) {
    return Api.request("POST", `feedbacks/`, {body})
}