export interface Boss {
    name: string;
    flavorText: string;
    abilities: Ability[];
}

export interface Ability {
    name: string;
    description: string;
    icon: string;
    heroicChanges: string;
    mythicChanges: string;
    childrenAbility?: string;
}

