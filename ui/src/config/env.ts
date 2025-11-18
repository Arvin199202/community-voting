// Environment configuration
export const config = {
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '88306a972a77389d91871e08d26516af',

  // Contract addresses
  contractAddresses: {
    sepolia: import.meta.env.VITE_CONTRACT_ADDRESS_SEPOLIA || '0x118D66433E901268f44c8C4cB4A6F14f0745A572',
    localhost: import.meta.env.VITE_CONTRACT_ADDRESS_LOCALHOST || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  },

  // FHEVM RPC URLs
  fhevmRpcUrls: {
    sepolia: import.meta.env.VITE_FHEVM_RPC_URL_SEPOLIA || 'https://devnet.zama.ai',
    localhost: import.meta.env.VITE_FHEVM_RPC_URL_LOCALHOST || 'http://localhost:8545',
  },

  // App configuration
  app: {
    name: 'Community Voting',
    description: 'Privacy-preserving community election voting system',
  },
} as const;
