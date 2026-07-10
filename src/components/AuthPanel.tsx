import { useState } from "react";
import { supabase, supabaseConfigError } from "../lib/supabase";

type AuthPanelProps = {
  onError: (message: string) => void;
};

type AuthMode = "login" | "signup";

export function AuthPanel({ onError }: AuthPanelProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!supabase) {
      onError(supabaseConfigError);
      return;
    }

    if (!email.trim() || !password) {
      onError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    onError("");

    const authAction =
      mode === "login"
        ? supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
        : supabase.auth.signUp({
            email: email.trim(),
            password,
          });

    const { error } = await authAction;
    setIsSubmitting(false);

    if (error) {
      onError(error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("登録しました。確認メールが届く設定の場合は、メールを確認してください。");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-8">
      <form
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-950">
            Kanban Task Board
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Supabaseにログインすると、ブラウザや端末を変えても同じタスクを使えます。
          </p>
        </div>

        {supabaseConfigError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {supabaseConfigError}
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          <button
            className={`h-10 rounded-md text-sm font-semibold ${
              mode === "login"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600"
            }`}
            type="button"
            onClick={() => setMode("login")}
          >
            ログイン
          </button>
          <button
            className={`h-10 rounded-md text-sm font-semibold ${
              mode === "signup"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600"
            }`}
            type="button"
            onClick={() => setMode("signup")}
          >
            新規登録
          </button>
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">
            メールアドレス
          </span>
          <input
            className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">
            パスワード
          </span>
          <input
            className="h-12 w-full rounded-md border border-slate-300 px-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <button
          className="h-12 w-full rounded-md bg-blue-600 px-4 text-base font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          type="submit"
          disabled={isSubmitting || Boolean(supabaseConfigError)}
        >
          {isSubmitting ? "処理中..." : mode === "login" ? "ログイン" : "登録する"}
        </button>

        {message && (
          <p className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
