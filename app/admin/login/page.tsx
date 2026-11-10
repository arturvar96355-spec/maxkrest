"use client";
import { useActionState } from "react";
import { loginAction } from "../actions";

export default function Login() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="mb-6 text-2xl font-bold text-navy">Вход в панель</h1>
      <form action={action} className="space-y-4">
        <div><label className="label" htmlFor="email">E-mail</label><input id="email" name="email" type="email" required autoComplete="username" className="field" /></div>
        <div><label className="label" htmlFor="password">Пароль</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
        {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="btn btn-primary w-full">{pending ? "Входим…" : "Войти"}</button>
      </form>
    </div>
  );
}
