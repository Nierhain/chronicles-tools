const classColors: Record<number, { hex: string; class: string, tailwindText: string }> = {
    1: {
        hex: '#C69B6D',
        class: 'warrior',
        tailwindText: 'text-warrior',
    },
    2: {
        hex: '#F48CBA',
        class: 'paladin',
        tailwindText: 'text-paladin',
    },
    3: {
        hex: '#AAD372',
        class: 'hunter',
        tailwindText: 'text-hunter',
    },
    4: {
        hex: '#FFF468',
        class: 'rogue',
        tailwindText: 'text-rogue',
    },
    5: {
        hex: '#FFFFFF',
        class: 'priest',
        tailwindText: 'text-priest',
    },
    6: {
        hex: '#C41E3A',
        class: 'deathknight',
        tailwindText: 'text-deathknight',
    },
    7: {
        hex: '#0070DD',
        class: 'shaman',
        tailwindText: 'text-shaman',
    },
    8: {
        hex: '#3FC7EB',
        class: 'mage',
        tailwindText: 'text-mage',
    },
    9: {
        hex: '#8788EE',
        class: 'warlock',
        tailwindText: 'text-warlock',
    },
    10: {
        hex: '#00FF98',
        class: 'monk',
        tailwindText: 'text-monk',
    },
    11: {
        hex: '#FF7C0A',
        class: 'druid',
        tailwindText: 'text-druid',
    },
    12: {
        hex: '#A330C9',
        class: 'demonhunter',
        tailwindText: 'text-demonhunter',
    },
    13: {
        hex: '#33937F',
        class: 'evoker',
        tailwindText: 'text-evoker',
    },
};

export function getClassColorHex(id: number) {
    if (id > 13 || id < 1) return '#000000';
    return classColors[id]?.hex;
}

export function getClassColorClass(id: number) {
    return classColors[id]?.class;
}

export function getClassFromId(id: number) {
    return classColors[id]?.class;
}