import { ConnectButton } from '@rainbow-me/rainbowkit';
import NetworkStatus from './NetworkStatus';
import logo from '@/assets/logo.png';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <img src={logo} alt="Community Voting Logo" className="w-8 h-8 md:w-10 md:h-10" />
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-semibold text-foreground">Community Voting</h1>
              <p className="text-xs text-muted-foreground">Privacy-Preserving Election</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-semibold text-foreground">Voting</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <NetworkStatus />
            <ConnectButton showBalance={false} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

