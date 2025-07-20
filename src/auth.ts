import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth } from 'better-auth/plugins/generic-oauth';
import { db } from '~/server/db';
import { env } from './env';

export interface BattleNetProfile {
    id: string;
    battletag: string;
    sub: string;
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
    }),
    socialProviders: {
        discord: {
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
        },
    },
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: 'battlenet',
                    scopes: ['wow.profile'],
                    authorizationUrl: 'https://oauth.battle.net/authorize',
                    tokenUrl: 'https://oauth.battle.net/token',
                    clientId: env.BATTLENET_CLIENT_ID,
                    clientSecret: env.BATTLENET_CLIENT_SECRET,
                    getUserInfo: async (tokens) => {
                        const response = await fetch(
                            'https://oauth.battle.net/userinfo',
                            {
                                headers: {
                                    'User-Agent': 'better-auth',
                                    authorization: `Bearer ${tokens.accessToken}`,
                                },
                            }
                        );
                        if (!response.ok) {
                            return null;
                        }

                        const profile =
                            (await response.json());
                        console.log(profile)
                        console.log(tokens)
                        return {
                            id: profile.id,
                            name: profile.battletag,
                            email: '-', // Battle.net doesn't provide email
                            emailVerified: false,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            role: 'user',
                        };
                    },
                },
            ],
        }),
    ],
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: true,
                defaultValue: 'guest',
                input: false,
            },
        },
    },
    account: {
        accountLinking: {
            allowDifferentEmails: true,
        }
    }
    // hooks: {
    //     after: createAuthMiddleware(async (ctx) => {
    //         const mail = ctx.context.session?.user.email
    //         ctx.body = { ...ctx.body, mail }
            
    //     })
    // }
});
