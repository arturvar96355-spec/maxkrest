import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-3xl font-bold text-navy">Страница не найдена</h1>
      <Link href="/" className="btn btn-primary mt-6">На главную</Link>
    </div>
  );
}
