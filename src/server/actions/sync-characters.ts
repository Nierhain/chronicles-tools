import type { Character, WowCharacterResponse } from '~/models/WowCharacters';
import { db, } from '~/server/db';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createDelay } from '~/utils/js';
import { character, characterClassEnum, type CharacterClass, type CharacterInsertType, type CharacterRole } from '../db/schema';
import { getClassFromId } from '~/utils/wow';

type CharacterResponse =
    | {
          code: 'SESSION_NOT_FOUND' | 'ACCOUNT_NOT_FOUND' | 'TOKEN_EXPIRED';
      }
    | { code: 'OK'; characters: WowCharacterResponse };

export async function getCharacters(
    userId: string
): Promise<CharacterResponse> {
    const account = await db.query.account.findFirst({
        where: (account, { eq, and }) =>
            and(
                eq(account.providerId, 'battlenet'),
                eq(account.userId, userId)
            ),
    });
    if (!account || !account.accessToken || !account.accessTokenExpiresAt)
        return { code: 'ACCOUNT_NOT_FOUND' };

    if (account.accessTokenExpiresAt < new Date())
        return { code: 'TOKEN_EXPIRED' };

    const response = await fetch(
        'https://eu.api.blizzard.com/profile/user/wow?region=eu&namespace=profile-eu&locale=en_US',
        {
            headers: {
                authorization: `Bearer ${account.accessToken}`,
            },
        }
    );
    const characters = await response.json();
    return { code: 'OK', characters: characters as WowCharacterResponse };
}

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 s'),
    prefix: '@upstash/ratelimit',
})

const identifier = 'import-characters';

export async function importCharacters(characters: Character[], userId: string) {
    const wowCharacters: CharacterInsertType[] = [];
    characters.forEach(async (char) => {
        const success = ratelimit.limit(identifier);
        if (!success) await createDelay(1000);

        const response = await fetch(`https://eu.api.blizzard.com/profile/user/wow/${char.realm.slug}/${char.name}/character-media`)
        const media = await response.json() as CharacterMedia;
        const character: CharacterInsertType = {
            name: char.name,
            realm: char.realm.name,
            mainRole: 'dps' as CharacterRole,
            class: getClassFromId(char.playable_class.id) as CharacterClass,
            level: char.level,
            render: media.assets.find(x => x.key === 'main-raw')?.value,
            avatar: media.assets.find(x => x.key === 'avatar')?.value,
            userId: userId,
            wowId: char.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        wowCharacters.push(character);
    });
    await db.insert(character).values(wowCharacters);
}

type CharacterMedia = {
    character: { name: string, id: number };
    assets: { key: string, value: string }[];
}