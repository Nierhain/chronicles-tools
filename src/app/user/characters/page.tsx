import { headers } from 'next/headers';
import { auth } from '~/auth';
import BattlenetSync from '~/components/battlenet-sync';
import ImportCharacterList from '~/components/import-character-list';
import {
    getCharacters,
    importCharacters,
} from '~/server/actions/sync-characters';
import {
    getAccountLabelsForUser,
    getCharactersForUser,
} from '~/server/data/characters';

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) return <div>Loading...</div>;
    const importedCharacters = await getCharactersForUser(session.user.id);
    const characters = await getCharacters(session.user.id);
    const accountLabels = await getAccountLabelsForUser(session.user.id);
    if (characters.code === 'TOKEN_EXPIRED') return <LogIntoBattlenet />;
    if (characters.code !== 'OK') return <div>{characters.code}</div>;

    return (
        <div className="flex flex-col gap-2">
            <h1>Characters</h1>
            <ImportCharacterList
                accountLabels={accountLabels}
                accounts={characters.characters.wow_accounts}
                importedCharacters={importedCharacters.map((x) => x.wowId)}
                importCharacters={async (chars) => {
                    'use server';
                    importCharacters(chars, session.user.id);
                }}
            />
        </div>
    );
}

async function LogIntoBattlenet() {
    return (
        <div className="flex min-h-full flex-col gap-2 items-center justify-center">
            <BattlenetSync />
        </div>
    );
}
