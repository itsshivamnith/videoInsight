// frontend/src/components/navbar/Navbar.jsx
import { NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `transition-all duration-300 border-b-2 py-3 px-1 ${
    isActive 
      ? "text-[#4a90e2] border-[#4a90e2] font-medium" 
      : "text-gray-400 border-transparent hover:text-gray-200 hover:border-white/10"
  }`;

export default function Navbar() {
  return (
    <nav className="bg-[#05050A]/80 backdrop-blur-md border-b border-white/[0.04] sticky top-14 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-12 overflow-x-auto no-scrollbar">
          <div className="flex gap-8 font-light text-sm tracking-wide whitespace-nowrap mx-auto md:mx-0 h-full items-center">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/feed" className={navLinkClass}>
              Feed
            </NavLink>
            <NavLink to="/playlist" className={navLinkClass}>
              Playlist
            </NavLink>
            <NavLink to="/learning" className={navLinkClass}>
              My Learning
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
