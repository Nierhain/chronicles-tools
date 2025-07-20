'use client';

import { AvatarImage } from '@radix-ui/react-avatar';
import { ChevronDown, ChevronUp, Edit, Save, X } from 'lucide-react';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { twMerge } from 'tailwind-merge';
import type { Character, WowAccountResponse } from '~/models/WowCharacters';
import type { AccountLabel } from '~/server/db/schema';
import { getClassColorClass, getClassFromId } from '~/utils/wow';
import BattlenetSync from './battlenet-sync';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from './ui/collapsible';
import { Input } from './ui/input';

type CharacterListProps = {
    accountLabels: AccountLabel[];
    accounts: WowAccountResponse[];
    importedCharacters: number[];
    importCharacters: (chars: Character[]) => Promise<void>;
};

type CharacterRealm = {
    name: string;
    characters: Character[];
};

function getCharactersByRealm(characters: Character[]) {
    const realms: CharacterRealm[] = [];
    characters.forEach((char) => {
        const realm = realms.find((realm) => realm.name === char.realm.name);
        if (realm) {
            realm.characters.push(char);
        } else {
            realms.push({
                name: char.realm.name,
                characters: [char],
            });
        }
    });
    return realms.sort((a, b) => a.name.localeCompare(b.name));
}

export default function ImportCharacterList({
    accounts,
    accountLabels,
    importedCharacters,
    importCharacters,
}: CharacterListProps) {
    const [charsToImport, setCharsToImport] = useState<Character[]>([]);
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between">
                <BattlenetSync />
                {charsToImport.length > 0 && (
                    <div className="flex gap-4 items-center">
                        <span>
                            {charsToImport.length} character(s) selected
                        </span>
                        <Button onClick={() => importCharacters(charsToImport)}>
                            Importieren
                        </Button>
                    </div>
                )}
            </div>
            {accounts.map((account) => (
                <AccountView
                    charsToImport={charsToImport}
                    account={account}
                    accountLabels={accountLabels}
                    onChange={(label) => alert(label)}
                    key={account.id}
                    setCharsToImport={setCharsToImport}
                    importedCharacters={importedCharacters}
                />
            ))}
        </div>
    );
}

function AccountView({
    account,
    accountLabels,
    charsToImport,
    onChange,
    importedCharacters,
    setCharsToImport,
}: {
    charsToImport: Character[];
    account: WowAccountResponse;
    accountLabels: AccountLabel[];
    onChange: (label: string) => void;
    importedCharacters: number[];
    setCharsToImport: Dispatch<SetStateAction<Character[]>>;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(
        accountLabels.find((x) => x.accountId === account.id)?.label ||
            account.id
    );

    return (
        <div key={account.id} className="bg-zinc-700 rounded-2xl">
            <div className="flex gap-2 py-2 px-4 items-center bg-zinc-800 rounded-t-2xl">
                {isEditing ? (
                    <Input value={label} onChange={(e) => {}} className="w-[200px]" />
                ) : (
                    <span>{label}</span>
                )}
                {isEditing ? (
                    <div className="flex gap-2"><Button onClick={() => {
                        
                    }}><Save /></Button><Button><X /></Button></div>
                ) : (
                    <Button
                        variant="link"
                        onClick={() => {
                            setIsEditing(true);
                        }}
                    >
                        <Edit />
                    </Button>
                )}
            </div>
            <div className="flex flex-col gap-2 py-2">
                {getCharactersByRealm(account.characters).map((realm) => (
                    <RealmView
                        key={realm.name}
                        realm={realm}
                        onChange={(char) => {
                            if (charsToImport.includes(char)) {
                                setCharsToImport((prev) =>
                                    prev.filter((c) => c !== char)
                                );
                            } else {
                                setCharsToImport((prev) => [...prev, char]);
                            }
                        }}
                        charsToImport={charsToImport}
                        importedChars={importedCharacters}
                    />
                ))}
            </div>
        </div>
    );
}

function RealmView({
    realm,
    charsToImport,
    importedChars,
    onChange,
}: {
    realm: CharacterRealm;
    charsToImport: Character[];
    importedChars: number[];
    onChange: (char: Character) => void;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const importableCharacters = realm.characters
        .filter((x) => !importedChars.includes(x.id))
        .sort((a, b) => b.level - a.level);
    return (
        <>
            <Collapsible
                key={realm.name}
                open={isOpen}
                onOpenChange={setIsOpen}
                className="p-2 w-full rounded-2xl"
            >
                <CollapsibleTrigger
                    className={twMerge(
                        isOpen ? 'rounded-t-2xl' : 'rounded-2xl',
                        'w-full flex justify-between py-2 px-4 bg-zinc-800'
                    )}
                >
                    <div>{realm.name}</div>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-2 p-4 bg-zinc-900 rounded-bl-2xl rounded-br-2xl">
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={() =>
                                importableCharacters.forEach((c) => onChange(c))
                            }
                        >
                            {realm.characters.every((x) =>
                                charsToImport.includes(x)
                            )
                                ? 'Deselect'
                                : 'Select'}{' '}
                            all
                        </Button>
                    </div>
                    <div>
                        {importableCharacters.map((char) => (
                            <div key={char.id} className="grid grid-cols-4">
                                <div className="flex gap-2 items-center">
                                    <Avatar className="w-5 h-5">
                                        <AvatarImage
                                            src={`https://render.worldofwarcraft.com/eu/icons/56/classicon_${getClassFromId(
                                                char.playable_class.id
                                            )}.jpg`}
                                        />
                                        <AvatarFallback>
                                            {char.playable_class.name.substring(
                                                0,
                                                1
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="">{char.name}</span>
                                </div>
                                <span className="flex justify-between w-14">
                                    <span>Lv.</span>
                                    <span>{char.level}</span>
                                </span>
                                <span>
                                    {char.playable_race.name}{' '}
                                    <span
                                        className={`text-${getClassColorClass(
                                            char.playable_class.id
                                        )}`}
                                    >
                                        {char.playable_class.name}
                                    </span>
                                </span>
                                <div className="flex justify-end pr-4">
                                    <Checkbox
                                        checked={charsToImport.includes(char)}
                                        onCheckedChange={() => {
                                            onChange(char);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </>
    );
}

// {
//     account.characters.map((char) => (
//         <div key={char.id} className="flex gap-2">
//             {char.name} - {char.realm.name}
//             <Checkbox
//                 key={char.id}
//                 checked={charToImport.includes(char)}
//             />
//         </div>
//     ));
// }
