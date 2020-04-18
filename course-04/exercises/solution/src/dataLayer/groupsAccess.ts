import * as AWS from "aws-sdk"
import * as AWSXRay from "aws-xray-sdk"
import { Group } from "../models/Group"

const XAWS = AWSXRay.captureAWS(AWS)

export class GroupAccess {
    constructor (
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly groupsTable = process.env.GROUPS_TABLE
    ) {}

    async getAllGroups(): Promise<Group[]> {
        // Scan operation parameters
        const scanParams = {
            TableName: this.groupsTable,
            // TODO: Set correct pagination parameters
            Limit: 100
            // ExclusiveStartKey: nextKey ? JSON.parse(decodeURIComponent(nextKey)) : null
        }
        
        const result = await this.docClient.scan(scanParams).promise()
        const items = result.Items

        return items as Group[]
    }

    async createGroup(newGroup: Group): Promise<Group> {
        console.log(`Creating group with id ${newGroup.id}`
        )
        await this.docClient.put({
            TableName: this.groupsTable,
            Item: newGroup
        }).promise()

        return newGroup
    }
}