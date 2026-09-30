import { NavLink } from "react-router-dom"


function Navbar() {
  return (
    <div className="sticky top-6 inset-x-0 z-50 pointer-events-none px-[8vw] pt-4 pb-20">
      <div className="mx-auto flex w-full max-w-360 justify-center">

      <nav className="pointer-events-auto flex w-full items-center justify-between rounded-full border border-white/40 bg-white/60 px-4 py-2 shadow-[0_4px_29px_rgba(148,163,184,0.17)] backdrop-blur-[11px]">

        <div className="flex items-center gap-8">
          <NavLink to="/dashboard" className="flex items-center gap-2">
          {/* <img src={Logo} alt="MedVault logo" /> */}
           
          </NavLink>

          <div className="hidden items-center gap-6 text-sm text-foreground sm:flex">
            <NavLink to="/" className="hover:text-foreground">
              Home
            </NavLink>

            <NavLink to="/waterings" className="hover:text-foreground">
              waterings
            </NavLink>

            <NavLink to="/waterings" className="hover:text-foreground">
              waterings
            </NavLink>

          </div>
        </div>

        
      </nav>
      </div>
    </div>
  )
}

export default Navbar