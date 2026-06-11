import React from 'react';

type StatusBannerProps = {
  status?: string | null;
};

export default function StatusBanner({ status }: StatusBannerProps) {
  const config: Record<string, { label: string; className: string }> = {
    EN_ATTENTE: {
      label: 'Profil en attente de validation',
      className: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    VALIDE: {
      label: 'Profil validé',
      className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    },
    SUSPENDU: {
      label: 'Compte suspendu',
      className: 'bg-rose-50 text-rose-900 border-rose-200',
    },
    RADIE: {
      label: 'Compte radié',
      className: 'bg-rose-50 text-rose-900 border-rose-200',
    },
  };

  const current = status ? config[status] : null;
  if (!current) return null;

  return (
    <div className={`rounded-xl border p-4 text-sm font-medium ${current.className}`}>
      {current.label}
    </div>
  );
}
