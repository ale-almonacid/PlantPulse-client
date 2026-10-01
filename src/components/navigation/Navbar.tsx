import { NavLink } from "react-router-dom"

// Shadcn Icons
import { CalendarDays, Droplets, House, Leaf } from "lucide-react"

// Assets
//import Logo from "@/assets/PlantPulse-logo.svg"
import Logo from "@/assets/logo-semibold-plantpulse.svg"
//import Logo from "@/assets/logo-regular-plantpulse.svg"


const links = [
  { to: "/", label: "Home", icon: House },
  { to: "/plants", label: "My plants", icon: Leaf },
  { to: "/waterings", label: "Waterings", icon: Droplets },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
]

function Navbar() {
  return (
    <>
    <div className="sticky top-6 inset-x-0 z-50 pointer-events-none px-[8vw] pt-4 pb-10">
      <div className="mx-auto flex w-full max-w-360 justify-center">

      <nav className="pointer-events-auto flex w-full items-center justify-between rounded-full border border-white/40 bg-white/60 px-6 py-5 shadow-[0_4px_29px_rgba(148,163,184,0.17)] backdrop-blur-[11px]">

        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2 font-medium">
            <img src={Logo} alt="PlantPulse" className="h-5 w-auto" />
          </NavLink>

          <div className="hidden items-center gap-6 text-sm sm:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

      </nav>
      </div>
    </div>

    {/* Mobile: floating pill at the bottom with one icon per page (the text links above are hidden) */}
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center sm:hidden">
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full bg-white p-2 shadow-[0_4px_29px_rgba(148,163,184,0.25)] dark:bg-card">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            aria-label={link.label}
            className={({ isActive }) =>
              `flex size-14 items-center justify-center rounded-full ${
                isActive ? "bg-muted text-foreground" : "text-muted-foreground"
              }`
            }
          >
            <link.icon className="size-6" />
          </NavLink>
        ))}
      </nav>
    </div>
    </>
  )
}

export default Navbar
