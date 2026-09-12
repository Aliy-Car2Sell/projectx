"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Ban, Search, ShieldCheck, Users } from "lucide-react";
import type { User, UserRole } from "@projectx/types";
import { fmtDate } from "@projectx/utils/dates";
import { Avatar } from "@projectx/ui/Avatar";
import { Badge } from "@projectx/ui/Badge";
import { Button } from "@projectx/ui/Button";
import { Chip } from "@projectx/ui/Chip";
import { EmptyState } from "@projectx/ui/EmptyState";
import { Input } from "@projectx/ui/Input";
import { UserStatusBadge } from "@projectx/ui/StatusBadge";
import { DataList } from "./DataList";

export function AdminUsers({ users: initial }: { users: User[] }) {
  const t = useTranslations("admin.users");
  const tc = useTranslations("common");
  const tr = useTranslations("shell.role");
  const locale = useLocale();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [users, setUsers] = useState(initial);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users.filter((u) => (role === "all" || u.role === role) && (!s || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(s)));
  }, [users, q, role]);

  const name = (u: User) => `${u.firstName} ${u.lastName}`;
  const toggle = (u: User) => setUsers((all) => all.map((x) => (x.id === u.id ? { ...x, status: x.status === "blocked" ? "active" : "blocked" } : x)));
  const roleTone = { patient: "primary", doctor: "accent", admin: "warning" } as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Input wrapperClassName="flex-1 min-w-0" placeholder={t("searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} leftIcon={<Search className="h-4 w-4" />} type="search" />
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {(["all", "patient", "doctor", "admin"] as const).map((r) => (
            <Chip key={r} active={role === r} onClick={() => setRole(r)} className="min-h-[36px]">
              {r === "all" ? t("allRoles") : tr(r)}
            </Chip>
          ))}
        </div>
      </div>
      <div className="text-sm text-muted">{t("found", { count: rows.length })}</div>

      {rows.length === 0 ? (
        <EmptyState icon={<Users className="h-7 w-7" />} title={t("noUsers")} description={t("noUsersDesc")} />
      ) : (
        <DataList
          rows={rows}
          keyOf={(u) => u.id}
          columns={[
            {
              key: "user",
              header: tc("name"),
              render: (u) => (
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatarUrl} name={name(u)} size="sm" />
                  <div>
                    <div className="font-semibold text-heading">{name(u)}</div>
                    <div className="text-xs text-muted">{u.email}</div>
                  </div>
                </div>
              ),
            },
            { key: "role", header: t("role"), render: (u) => <Badge tone={roleTone[u.role]}>{tr(u.role)}</Badge> },
            { key: "phone", header: tc("phone"), render: (u) => u.phone },
            { key: "registered", header: t("registered"), render: (u) => fmtDate(locale, tc, u.createdAt) },
            { key: "status", header: tc("status"), render: (u) => <UserStatusBadge status={u.status} /> },
          ]}
          actions={(u) =>
            u.role === "admin" ? null : u.status === "blocked" ? (
              <Button variant="secondary" size="sm" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => toggle(u)}>
                {t("unblock")}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="text-danger" icon={<Ban className="h-4 w-4" />} onClick={() => toggle(u)}>
                {t("block")}
              </Button>
            )
          }
          mobileCard={(u) => (
            <div className="flex items-start gap-3">
              <Avatar src={u.avatarUrl} name={name(u)} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-heading truncate">{name(u)}</span>
                  <UserStatusBadge status={u.status} />
                </div>
                <div className="text-xs text-muted truncate">{u.email}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <Badge tone={roleTone[u.role]}>{tr(u.role)}</Badge>
                  <span>{fmtDate(locale, tc, u.createdAt, "short")}</span>
                </div>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
