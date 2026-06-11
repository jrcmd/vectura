export default function ForgotPassword(): JSX.Element {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="font-extrabold">Vectura</div>
      </header>
      <main className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold">Mot de passe oublié</h1>
        <p className="mt-2 text-slate-600">
          Entrez votre email pour recevoir un lien de réinitialisation (simulation locale pour ce sprint).
        </p>
        <form className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="vous@exemple.fr"
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition"
          >
            Envoyer le lien
          </button>
        </form>
      </main>
    </div>
  );
}
