"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            GoodCred
          </div>
        </Link>

        <nav className="flex items-center space-x-6">
          {isConnected && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/quests"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Quests
              </Link>
              <Link
                href="/lending"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Lending
              </Link>
            </>
          )}
          <ConnectButton />
        </nav>
      </div>
    </header>
  );
}
