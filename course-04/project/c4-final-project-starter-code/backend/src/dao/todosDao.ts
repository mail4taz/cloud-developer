import * as AWS from "aws-sdk"
import * as AWSXRay from "aws-xray-sdk"
import { TodoItem } from "../models/TodoItem"
import { TodoUpdate } from "../models/TodoUpdate"
import { createLogger } from "../utils/logger"

const XAWS = AWSXRay.captureAWS(AWS)
const DATE_IDX = process.env.TODO_BY_DATE_IDX

export class TodosDao {
    constructor (
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODO_TABLE,
        private readonly logger = createLogger('TodosDao')
    ) {}

    async getAllTodosForUser(userId: string): Promise<TodoItem[]> {
        this.logger.info(`Fetching todos for user ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: DATE_IDX,
            KeyConditionExpression: 'userId = :user',
            ExpressionAttributeValues: {
                ':user': userId
            },
            ProjectionExpression: 'todoId, #n, createdAt, dueDate, done',
            ExpressionAttributeNames: {
                "#n": "name"
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(newTodo: TodoItem): Promise<TodoItem> {
        this.logger.info(`Creating todo with id ${newTodo.todoId}`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: newTodo
        }).promise()

        return newTodo
    }

    async loadTodo(todoItem: TodoItem): Promise<TodoItem> {
        this.logger.info(`Loading todo with id ${todoItem.todoId}`)

        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                userId: todoItem.userId,
                todoId: todoItem.todoId
            }
        }).promise()

        if (result.Item) {
            return result.Item as TodoItem
        }
    }

    async deleteTodo(todoItem: TodoItem) {
        this.logger.info(`Deleting todo with id ${todoItem.todoId}`)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: todoItem.userId,
                todoId: todoItem.todoId
            }
        }).promise()
    }

    async updateTodo(todoItem:TodoItem, updateItem: TodoUpdate) {
        this.logger.info(`Updating todo with id ${todoItem.todoId}`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: todoItem.userId,
                todoId: todoItem.todoId
            },
            UpdateExpression: 'SET #n=:name, done=:done, dueDate=:date',
            ExpressionAttributeNames: {
                "#n": "name"
            },
            ExpressionAttributeValues: {
                ':name': updateItem.name,
                ':done': updateItem.done,
                ':date': updateItem.dueDate
            }
        }).promise()
    }
}