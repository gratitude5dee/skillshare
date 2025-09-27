
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import ConnectWalletButton from "./ConnectWalletButton";
import manusLogo from "@/assets/manus-logo.png";

export const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div
      className="justify-between items-center backdrop-blur-md bg-[rgba(255,255,255,0.80)] flex w-full px-16 py-4 max-md:px-4"
      aria-label="Top navigation bar"
    >
      <div className="self-stretch flex min-w-60 w-full flex-col items-center flex-1 shrink basis-[0%] my-auto pt-6">
        <div className={`min-h-[100px] ${isMobile ? 'w-[160px]' : 'w-[223px]'} max-w-full`}>
          <img
            src={manusLogo}
            className="aspect-[2.22] object-contain w-full"
            alt="Manus Logo"
          />
        </div>
      </div>
      <div className="flex items-center">
        <ConnectWalletButton />
      </div>
    </div>
  );
};

export default Navbar;
