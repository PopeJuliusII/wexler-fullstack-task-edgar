import React from "react";
import logo from "../assets/images/logo-green-tld.svg";

const Header = () => {
  return (
    <div className="navbar flex justify-center items-center h-16">
      <a
        className="btn btn-ghost text-xl inline-flex items-center"
        href="https://www.wexler.ai"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={logo} alt="Logo" />
      </a>
    </div>
  );
};

export default Header;
