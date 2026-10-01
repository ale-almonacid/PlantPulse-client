import { useState } from "react"
import { NavLink } from "react-router-dom"

// Shadcn Icons
import { CalendarDays, Droplets, House, Leaf, Menu, X } from "lucide-react"

// Shadcn UI Imports
import { Button } from "@/components/ui/button"

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

  const [isMenuOpen, setIsMenuOpen] = useState(false) // mobile hamburger menu

  return (
    <div className="sticky top-6 inset-x-0 z-50 pointer-events-none px-[8vw] pt-4 pb-10">
      <div className="relative mx-auto flex w-full max-w-360 justify-center">

      <nav className="pointer-events-auto flex w-full items-center justify-between rounded-full border border-white/40 bg-white/60 px-6 py-5 shadow-[0_4px_29px_rgba(148,163,184,0.17)] backdrop-blur-[11px]">

        <NavLink to="/" className="flex items-center gap-2 font-medium" onClick={() => setIsMenuOpen(false)}>
          <img src={Logo} alt="PlantPulse" className="h-5 w-auto" />
        </NavLink>

        {/* Desktop: links on the right (the nav is justify-between) */}
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

        {/* Mobile: hamburger button (the text links above are hidden) */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="-my-2 sm:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>

      </nav>

      {/* Mobile: the menu opens under the navbar */}
      {isMenuOpen && (
        <div className="pointer-events-auto absolute inset-x-0 top-full mt-2 flex flex-col gap-1 rounded-3xl border border-white/40 bg-white p-2 shadow-[0_4px_29px_rgba(148,163,184,0.17)] backdrop-blur-[11px] sm:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${
                  isActive ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
                }`
              }
            >
              <link.icon className="size-4" />
              {link.label}
            </NavLink>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

export default Navbar
