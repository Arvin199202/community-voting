import React from 'react';
import { useContractEvents } from '../hooks/useContractEvents';
import { Button } from './ui/button';

export const EventMonitor: React.FC = () => {
  const { events, isListening, clearEvents } = useContractEvents();

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'VoteCast':
        return '🗳️';
      case 'ProposalCreated':
        return '📋';
      case 'VoteCountsUpdated':
        return '📊';
      default:
        return '📝';
    }
  };

  const formatAddress = (address?: string) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Contract Events</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-2 py-1 rounded ${isListening ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isListening ? '🟢 Listening' : '🔴 Disconnected'}
          </span>
          <Button variant="secondary" size="sm" onClick={clearEvents}>
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No events received yet. Events will appear here as they occur on the blockchain.
          </div>
        ) : (
          events.map((event, index) => (
            <div key={index} className="border rounded p-3 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getEventIcon(event.event)}</span>
                  <div>
                    <p className="font-medium text-sm">{event.event}</p>
                    <p className="text-xs text-gray-600">
                      Block #{event.blockNumber} • {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {event.voter && (
                    <p className="text-xs text-gray-500">
                      Voter: {formatAddress(event.voter)}
                    </p>
                  )}
                  {event.candidate !== undefined && (
                    <p className="text-xs text-gray-500">
                      Candidate: {event.candidate + 1}
                    </p>
                  )}
                  <p className="text-xs font-mono text-blue-600">
                    {event.transactionHash.slice(0, 10)}...
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Events are synchronized in real-time from the blockchain
      </div>
    </div>
  );
};
