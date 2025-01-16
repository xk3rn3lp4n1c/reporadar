import { APP_LOGO } from "@/lib/constants";
import { LinkSquare02Icon, Menu03Icon } from "hugeicons-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-[100vw] h-fit sticky top-0 bg-background z-50">
      <div className="w-[100vw] md:w-[65vw] mx-auto p-4 py-4 md:px-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold uppercase relative isolate">
          <img src={APP_LOGO} alt="" className="inline-block h-5" />
        </h1>
        <button
          type="button"
          className="lg:hidden z-50 grid h-10 w-10 place-items-center active:bg-primary/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu03Icon className="inline-block w-4 h-4" />
        </button>
        <div
          className={`fixed inset-0 ${
            isMenuOpen ? "grid" : "hidden"
          } place-items-center bg-background z-10 lg:flex lg:static lg:bg-transparent lg:z-auto`}
        >
          <div className="grid place-items-center gap-2 lg:flex lg:gap-8 lg:items-center">
            
            <Link
              to="/"
              className="text-sm rounded-full text-primary-foreground p-2 bg-primary px-4 shadow"
            >
              Fork on GitHub{" "}
              <LinkSquare02Icon className="inline-block w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
