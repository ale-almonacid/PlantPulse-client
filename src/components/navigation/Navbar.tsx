import { NavLink } from "react-router-dom"

// Assets
//import Logo from "@/assets/PlantPulse-logo.svg"
import Logo from "@/assets/logo-semibold-plantpulse.svg"
//import Logo from "@/assets/logo-regular-plantpulse.svg"


const links = [
  { to: "/", label: "Home" },
  { to: "/plants", label: "My plants" },
  { to: "/waterings", label: "Waterings" },
  { to: "/calendar", label: "Calendar" },
]

function Navbar() {
  return (
    <div className="sticky top-6 inset-x-0 z-50 pointer-events-none px-[8vw] pt-4 pb-20">
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
  )
}

export default Navbar
