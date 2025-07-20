import { roleLabels } from '~/server/db/schema';

export function UserRoleView({ role }: { role: string }) {
    return <span className="truncate text-xs">{roleLabels[role]}</span>;
}
