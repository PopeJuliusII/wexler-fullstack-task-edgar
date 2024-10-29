import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "./Header";
import logo from "../assets/images/logo-green-tld.svg";

/**
 * The Header component renders a logo that links to the Wexler website.
 */
describe("Header", () => {
  // Test that the logo in the Header component renders with the correct attributes.
  test("The logo in the Header component renders with the correct attributes.", () => {
    render(<Header />);
    const logoElement = screen.getByAltText("Logo");
    expect(logoElement).toBeInTheDocument();
    expect(logoElement).toHaveAttribute("src", logo);
  });

  // Test that the link in the Header component renders with the correct attributes.
  test("The link in the Header component renders with the correct attributes.", () => {
    render(<Header />);
    const logoElement = screen.getByAltText("Logo");
    const linkElement = logoElement.parentElement;
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "https://www.wexler.ai");
    expect(linkElement).toHaveAttribute("target", "_blank");
    expect(linkElement).toHaveAttribute("rel", "noopener noreferrer");
  });
});
