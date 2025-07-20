'use client';

import {
    BookText,
    Command,
    Frame,
    LifeBuoy,
    LogIn,
    Map,
    PieChart,
    Send,
    SquareTerminal,
    Users,
} from 'lucide-react';
import * as React from 'react';

import { NavMain } from '~/components/nav-main';
import { NavRaids } from '~/components/nav-raids';
import { NavSecondary } from '~/components/nav-secondary';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '~/components/ui/sidebar';
import { useLogin } from '~/hooks/use-login';
import { authClient } from '~/lib/authClient';
import { NavUser } from './nav-user';

const data = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
    },
    navMain: [
        {
            title: 'Roster',
            url: '/roster',
            icon: Users,
            isActive: true,
            // items: [
            //     {
            //         title: 'Mythic',
            //         url: '/roster?type=mythic',
            //     },
            //     {
            //         title: 'All',
            //         url: '/roster?type=all',
            //     },
            // ],
        },
    ],
    navSecondary: [
        {
            title: 'Support',
            url: '#',
            icon: LifeBuoy,
        },
        {
            title: 'Feedback',
            url: '#',
            icon: Send,
        },
    ],
    raids: [
        {
            name: 'Raid Guides',
            url: 'raids/guides',
            icon: BookText,
        },
        {
            name: 'Roster',
            url: 'raids/',
            icon: Users
        }
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session, isPending } = authClient.useSession();
    const login = useLogin();
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Command className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        Chronicles
                                    </span>
                                    <span className="truncate text-xs">
                                        Antonidas (EU)
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavRaids raids={data.raids} />
                {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
            </SidebarContent>
            <SidebarFooter>
                {session ? (
                    <NavUser
                        user={{
                            name: session.user.name,
                            avatar: session.user.image ?? '',
                            role: session.user.role,
                        }}
                    />
                ) : (
                    <SidebarMenuButton
                        onClick={() => {
                            login();
                        }}
                    >
                        <LogIn />
                        Login
                    </SidebarMenuButton>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
