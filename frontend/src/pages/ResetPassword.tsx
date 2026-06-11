import { useState } from 'react';

type ResetPasswordProps = {
  token?: string;
};

export default function ResetPassword({ token }: ResetPasswordProps): JSX.Element {
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="font-extrabold">Vectura</div>
      </header>
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold">Réinitialiser le mot de passe</h1>
        <p className="mt-2 text-slate-600">
          Définissez un nouveau mot de passe pour votre compte.
        </p>

        {submitted ? (
          <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Mot de passe mis à jour (simulation locale).
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium">Nouveau mot de passe</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition"
            >
              Mettre à jour
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
