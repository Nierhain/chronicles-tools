"use client"
import { authClient } from "~/lib/authClient";
import { Button } from "./ui/button";

export default function BattlenetSync() {
    return (
        <Button
            onClick={() => {
                authClient.oauth2.link({
                    providerId: 'battlenet',
                    callbackURL: "/user/characters",
                })
            }}
        >
            Log into Battle.net
        </Button>
    );
}