import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { setToken } from "../lib/api";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/propriedades", label: "Propriedades" },
  { to: "/quartos", label: "Quartos" },
  { to: "/moradores", label: "Moradores" },
  { to: "/pagamentos", label: "Pagamentos" },
];

export function Layout() {
  const navigate = useNavigate();

  function logout() {
    setToken(null);
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col bg-slate-900 px-4 py-6 text-slate-100">
        <h1 className="mb-8 px-2 text-xl font-bold tracking-tight">
          RepúblicaHub
        </h1>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          Sair
        </button>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
