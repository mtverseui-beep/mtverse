import type { Metadata } from 'next'
import Image from 'next/image'
import { Users } from 'lucide-react'
import { getCustomerUsersForAdmin } from '@/lib/auth/customer-store'

export const metadata: Metadata = {
  title: 'Users - Admin',
  description: 'View registered customers',
}

export const dynamic = 'force-dynamic'

const DEFAULT_USER_AVATAR = '/default-3d-avatar.jpg'

export default async function AdminUsersPage() {
  const customers = await getCustomerUsersForAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="ds-h1">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {customers.length} registered {customers.length === 1 ? 'user' : 'users'}
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="ds-card py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No users yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Email, Google, and GitHub customers will appear here after sign-in.
          </p>
        </div>
      ) : (
        <div className="ds-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Provider</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden xl:table-cell">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((user) => (
                  <tr key={user.email} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                          <Image
                            src={user.image || DEFAULT_USER_AVATAR}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized
                          />
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{user.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                        {user.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground text-xs">
                      {user.lastSeenAt
                        ? new Date(user.lastSeenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}