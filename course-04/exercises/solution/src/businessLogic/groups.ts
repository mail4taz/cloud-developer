import * as uuid from 'uuid'

import { Group } from "../models/Group"
import { GroupAccess } from "../dataLayer/groupsAccess"
import { CreateGroupRequest } from "../requests/CreateGroupRequest"
import { getUserId } from "../auth/utils"

const groupsAccess = new GroupAccess

export async function getAllGroups(): Promise<Group[]> {
    return await groupsAccess.getAllGroups()
}

export async function createGroup(groupRequest: CreateGroupRequest, jwtToken: string): Promise<Group> {
    console.log('Create group ', groupRequest)
    console.log('Create group token ', jwtToken)

    const itemId = uuid.v4()
    const userId = getUserId(jwtToken)

    const newGroup:Group = {
        id: itemId,
        timestamp: new Date().toISOString(),
        userId: userId,
        name: groupRequest.name,
        description: groupRequest.description
    }

    return await groupsAccess.createGroup(newGroup)  
}