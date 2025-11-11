import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { WalletConnector } from '../components/WalletConnector';

const Index: React.FC = () => {
  const [voteCounts, setVoteCounts] = useState({
    candidate1: 0,
    candidate2: 0,
    candidate3: 0,
    candidate4: 0,
    total: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVoteCounts(prev => ({
        candidate1: prev.candidate1 + Math.floor(Math.random() * 3),
        candidate2: prev.candidate2 + Math.floor(Math.random() * 3),
        candidate3: prev.candidate3 + Math.floor(Math.random() * 3),
        candidate4: prev.candidate4 + Math.floor(Math.random() * 3),
        total: prev.total + Math.floor(Math.random() * 12)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleVote = (candidateId: number) => {
    console.log(`Voting for candidate ${candidateId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Community Voting</h1>
          <WalletConnector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cast Your Vote
          </h2>
          <p className="text-lg text-gray-600">
            Choose your preferred candidate for the community committee
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[1, 2, 3, 4].map((candidateId) => (
            <div key={candidateId} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Candidate {candidateId}</h3>
              <p className="text-gray-600 mb-4">
                Current votes: {voteCounts[`candidate${candidateId}` as keyof typeof voteCounts]}
              </p>
              <Button
                onClick={() => handleVote(candidateId)}
                className="w-full"
              >
                Vote for Candidate {candidateId}
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Live Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {voteCounts.candidate1}
              </div>
              <div className="text-sm text-gray-600">Candidate 1</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {voteCounts.candidate2}
              </div>
              <div className="text-sm text-gray-600">Candidate 2</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {voteCounts.candidate3}
              </div>
              <div className="text-sm text-gray-600">Candidate 3</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {voteCounts.candidate4}
              </div>
              <div className="text-sm text-gray-600">Candidate 4</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t text-center">
            <div className="text-lg font-semibold">
              Total Votes: {voteCounts.total}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;