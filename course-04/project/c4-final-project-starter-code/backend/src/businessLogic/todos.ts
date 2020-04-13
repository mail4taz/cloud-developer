import * as uuid from 'uuid'

import { TodosDao } from "../dao/todosDao"
import { TodoItem } from "../models/TodoItem";
import { TodoUpdate } from "../models/TodoUpdate";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const todosDao = new TodosDao

export async function getAllTodosForUser(userId: string): Promise<TodoItem[]> {
    return todosDao.getAllTodosForUser(userId)
}

export async function createTodo(newTodoReq: CreateTodoRequest, currentUser: string): Promise<TodoItem> {

    const newItem: TodoItem = {
        userId: currentUser,
        todoId: uuid.v4(),
        createdAt: new Date().toISOString(),
        name: newTodoReq.name,
        dueDate: newTodoReq.dueDate,
        done: false
    }

    return await todosDao.createTodo(newItem)  
}

export async function deleteTodo(todoId: string, currentUser: string) {
    let delItem = await getTodo(todoId, currentUser)
    if (!delItem) {
        return
    }

    await todosDao.deleteTodo(delItem)
    return delItem
}

export async function getTodo(todoId: string, currentUser: string): Promise<TodoItem> {

    const anItem = {
        userId: currentUser,
        todoId: todoId
    } as TodoItem

    return await todosDao.loadTodo(anItem)  
}

export async function updateTodo(todoId: string, currentUser: string, updatedTodoReq: UpdateTodoRequest): Promise<TodoItem> {

    let itemToUpdate = await getTodo(todoId, currentUser)
    if (!itemToUpdate) {
        return
    }
    console.log(itemToUpdate)
    const updatedTodo = updatedTodoReq as TodoUpdate
    console.log(updatedTodo)
    await todosDao.updateTodo(itemToUpdate, updatedTodo)

    itemToUpdate = {...updatedTodo} as TodoItem
    console.log(itemToUpdate)
    return itemToUpdate
}
