'use client';

import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function AdminTopbar() {
  return (
    <header className="admin-topbar">
      {/* Titre raffiné calligraphique / italique */}
      <div className="admin-topbar-brand">
        <span className="admin-topbar-title">
          Back-office
        </span>
      </div>

      {/* Right actions */}
      <div className="admin-topbar-actions">
        <button className="admin-topbar-icon-btn" title="Notifications">
          <Bell size={18} />
          <span className="admin-notif-dot" />
        </button>
        <div className="admin-topbar-user">
          <Avatar className="admin-topbar-avatar">
            <AvatarFallback className="admin-topbar-avatar-fb">A</AvatarFallback>
          </Avatar>
          <span className="admin-topbar-username">Admin</span>
        </div>
      </div>
    </header>
  );
}
