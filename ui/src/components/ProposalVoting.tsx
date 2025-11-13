import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface Proposal {
  id: number;
  title: string;
  description: string;
  creator: string;
  createdAt: number;
  active: boolean;
}

export const ProposalVoting: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newProposal, setNewProposal] = useState({ title: '', description: '' });

  useEffect(() => {
    // Mock data for proposals
    setProposals([
      {
        id: 1,
        title: 'Community Garden Project',
        description: 'Establish a community garden in the central park area',
        creator: '0x1234...abcd',
        createdAt: Date.now() - 86400000,
        active: true
      },
      {
        id: 2,
        title: 'Neighborhood Security Initiative',
        description: 'Implement additional security measures for the neighborhood',
        creator: '0x5678...efgh',
        createdAt: Date.now() - 172800000,
        active: true
      }
    ]);
  }, []);

  const handleCreateProposal = () => {
    if (newProposal.title && newProposal.description) {
      const proposal: Proposal = {
        id: proposals.length + 1,
        title: newProposal.title,
        description: newProposal.description,
        creator: '0xcurrent...user',
        createdAt: Date.now(),
        active: true
      };
      setProposals([...proposals, proposal]);
      setNewProposal({ title: '', description: '' });
    }
  };

  const handleVote = (proposalId: number, vote: boolean) => {
    console.log(`Voting ${vote ? 'yes' : 'no'} on proposal ${proposalId}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Create New Proposal</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Proposal Title"
            value={newProposal.title}
            onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Proposal Description"
            value={newProposal.description}
            onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
            className="w-full p-2 border rounded h-24"
          />
          <Button onClick={handleCreateProposal} className="w-full">
            Create Proposal
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Active Proposals</h3>
        {proposals.map((proposal) => (
          <div key={proposal.id} className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-medium mb-2">{proposal.title}</h4>
            <p className="text-gray-600 mb-4">{proposal.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                Created by: {proposal.creator}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(proposal.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => handleVote(proposal.id, true)} variant="secondary">
                Vote Yes
              </Button>
              <Button onClick={() => handleVote(proposal.id, false)} variant="secondary">
                Vote No
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
