import React from 'react';
import { Button } from '../components/ui/button';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Community Voting</h1>
        <p className="text-gray-600 mb-4 text-center">
          Cast your vote for community committee candidates
        </p>
        <div className="space-y-3">
          <Button onClick={() => console.log('Vote for candidate 1')}>
            Vote for Candidate 1
          </Button>
          <Button onClick={() => console.log('Vote for candidate 2')}>
            Vote for Candidate 2
          </Button>
          <Button onClick={() => console.log('Vote for candidate 3')}>
            Vote for Candidate 3
          </Button>
          <Button onClick={() => console.log('Vote for candidate 4')}>
            Vote for Candidate 4
          </Button>
        </div>
        <div className="mt-6 text-center">
          <Button variant="secondary" onClick={() => console.log('View results')}>
            View Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;