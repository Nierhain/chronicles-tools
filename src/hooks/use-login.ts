import { authClient } from '~/lib/authClient';

export function useLogin() {
    return function() {
        authClient.signIn.social({
            provider: 'discord',
            callbackURL: '/',
        });
    };
}
