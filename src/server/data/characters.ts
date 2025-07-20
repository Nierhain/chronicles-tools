import { db } from "../db";
import { accountLabels } from "../db/schema";

export async function getCharactersForUser(userId: string) {
    return await db.query.character.findMany({
        where: (character, { eq }) => eq(character.userId, userId),
    })
}

export async function getAccountLabelsForUser(userId: string) {
    return await db.query.accountLabels.findMany({
        where: (account, { eq }) => eq(account.userId, userId),
    })
}

export async function createAccountLabel(label: string, accountId: number, userId: string) {
    return await db.insert(accountLabels).values({
        accountId: accountId,
        label: label,
        userId: userId,
    })
}