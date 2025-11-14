import React, { useState } from 'react';
import { Button } from './ui/button';

interface VoteRecord {
  id: number;
  candidateId: number;
  timestamp: number;
  transactionHash: string;
}

export const VoteHistory: React.FC = () => {
  const [userAddress, setUserAddress] = useState('');
  const [voteHistory, setVoteHistory] = useState<VoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleQueryHistory = async () => {
    if (!userAddress.trim()) return;

    setIsLoading(true);
    try {
      // Mock data for demonstration
      const mockHistory: VoteRecord[] = [
        {
          id: 1,
          candidateId: 1,
          timestamp: Date.now() - 86400000,
          transactionHash: '0x1234567890abcdef...'
        },
        {
          id: 2,
          candidateId: 3,
          timestamp: Date.now() - 172800000,
          transactionHash: '0xabcdef1234567890...'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVoteHistory(mockHistory);
    } catch (error) {
      console.error('Failed to query vote history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCandidateName = (id: number) => {
    return `Candidate ${id}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Vote History Query</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            placeholder="0x..."
            className="w-full p-2 border rounded"
          />
        </div>

        <Button
          onClick={handleQueryHistory}
          disabled={isLoading || !userAddress.trim()}
          className="w-full"
        >
          {isLoading ? 'Querying...' : 'Query Vote History'}
        </Button>
      </div>

      {voteHistory.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-4">Voting History</h4>
          <div className="space-y-3">
            {voteHistory.map((vote) => (
              <div key={vote.id} className="border rounded p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      Voted for: {getCandidateName(vote.candidateId)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(vote.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Transaction</p>
                    <p className="text-xs font-mono text-blue-600">
                      {vote.transactionHash.slice(0, 20)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {voteHistory.length === 0 && userAddress.trim() && !isLoading && (
        <div className="mt-6 text-center text-gray-500">
          No voting history found for this address.
        </div>
      )}
    </div>
  );
};
