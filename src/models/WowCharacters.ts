export type WowCharacterResponse = {
    id: number;
    wow_accounts: WowAccountResponse[];
};

export type WowAccountResponse = {
    id: number;
    characters: Character[];
};

export type Character = {
    character: { href: string };
    protected_character: { href: string };
    name: string;
    id: number;
    realm: { key: { href: string }; name: string; id: number; slug: string };
    playable_class: { key: { href: string }; name: string; id: number };
    playable_race: { key: { href: string }; name: string; id: number };
    gender: { type: string; name: string };
    faction: { type: string; name: string };
    level: number;
};
