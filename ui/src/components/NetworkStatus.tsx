import { useAccount, useChainId } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { hardhat, sepolia } from 'wagmi/chains';

const NetworkStatus = () => {
  const { isConnected, isConnecting } = useAccount();
  const chainId = useChainId();

  const getNetworkInfo = () => {
    switch (chainId) {
      case hardhat.id:
        return { name: 'Local Hardhat', color: 'secondary' as const };
      case sepolia.id:
        return { name: 'Sepolia Testnet', color: 'primary' as const };
      default:
        return { name: 'Unsupported Network', color: 'destructive' as const };
    }
  };

  const networkInfo = getNetworkInfo();

  if (!isConnected) {
    return (
      <Card className="p-3 border-destructive/50 bg-destructive/5">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">Not Connected</span>
        </div>
      </Card>
    );
  }

  if (isConnecting) {
    return (
      <Card className="p-3 border-yellow-500/50 bg-yellow-500/5">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-yellow-700 dark:text-yellow-300">Connecting...</span>
        </div>
      </Card>
    );
  }

  const isSupportedNetwork = chainId === hardhat.id || chainId === sepolia.id;

  return (
    <Card className={`p-3 border-${networkInfo.color}/50 bg-${networkInfo.color}/5`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isSupportedNetwork ? (
            <Wifi className={`w-4 h-4 text-${networkInfo.color}`} />
          ) : (
            <AlertTriangle className={`w-4 h-4 text-${networkInfo.color}`} />
          )}
          <span className="text-sm font-medium">{networkInfo.name}</span>
        </div>
        <Badge variant={networkInfo.color === 'destructive' ? 'destructive' : 'secondary'} className="text-xs">
          {isSupportedNetwork ? 'Supported' : 'Unsupported'}
        </Badge>
      </div>
    </Card>
  );
};

export default NetworkStatus;
