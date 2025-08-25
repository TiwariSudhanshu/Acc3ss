"use client";

import { X, Download } from "lucide-react";
import { useRef } from "react";
import { toPng } from "html-to-image";
import TicketComponent from "../ticket";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

interface Event {
  id: number;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
  price: string;
  attendees: number;
  category: string;
  status: string;
  organizer: string;
  ticketId?: number;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicket: Event | null;
}

export default function TicketModal({
  isOpen,
  onClose,
  selectedTicket,
}: TicketModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelector((state: RootState) => state.user);

  if (!isOpen || !selectedTicket) return null;

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        width: 960,
        height: 384,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `ticket-${selectedTicket.title
        ?.replace(/\s+/g, "-")
        .toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export image", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-700 w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Event Ticket
          </h2>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleDownload}
              className="text-gray-400 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-gray-800 rounded-lg"
              title="Download Ticket"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1.5 sm:p-2 hover:bg-gray-800 rounded-lg"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        <div
          className="p-2 sm:p-4 md:p-6 flex items-center justify-center overflow-x-auto"
          ref={ticketRef}
        >
          <div className="min-w-fit">
            <TicketComponent
              eventId={selectedTicket.ticketId?.toString()}
              eventTitle={selectedTicket.title}
              eventBanner={selectedTicket.image}
              eventDate={selectedTicket.date}
              eventTime={selectedTicket.time}
              location={selectedTicket.location}
              organizerName={selectedTicket.organizer}
              price={selectedTicket.price}
              userName={currentUser.name}
              userWallet={currentUser.walletAddress}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
