import { useEffect, useState } from 'react';

interface ContractEvent {
  event: string;
  voter?: string;
  candidate?: number;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

export const useContractEvents = () => {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const startListening = () => {
      if (window.EventSource) {
        setIsListening(true);
        eventSource = new EventSource('/api/events');

        eventSource.onmessage = (event) => {
          try {
            const eventData = JSON.parse(event.data);
            const newEvent: ContractEvent = {
              event: eventData.event,
              voter: eventData.voter,
              candidate: eventData.candidate,
              transactionHash: eventData.transactionHash,
              blockNumber: eventData.blockNumber,
              timestamp: Date.now()
            };

            setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events
          } catch (error) {
            console.error('Failed to parse event:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('EventSource error:', error);
          setIsListening(false);
        };
      }
    };

    const stopListening = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      setIsListening(false);
    };

    startListening();

    return () => {
      stopListening();
    };
  }, []);

  const clearEvents = () => {
    setEvents([]);
  };

  return {
    events,
    isListening,
    clearEvents
  };
};
