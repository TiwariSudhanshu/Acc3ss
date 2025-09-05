"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getContract } from "@/contract/contract";

import ProfileSidebar from "./profile-sidebar";
import ProfileTabs from "./profile-tabs";
import EventsAttended from "./events-attended";
import EventsCreated from "./events-created";
import OwnedTickets from "./owned-tickets";
import TicketModal from "./ticket-modal";
import ManageEventModal from "./manage-event-modal";
import SettingsModal from "./settings-modal";
import { formatEther } from "ethers";

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
  withdrawalAmount?: number;
}

interface Speaker {
  name: string;
  role: string;
  avatar?: string;
}

interface AgendaItem {
  time: string;
  title: string;
  speaker?: string;
}

interface IPFSMetadata {
  eventName?: string;
  description?: string;
  category?: string;
  image?: string;
  location?: string;
  startDateTime?: string;
  endDateTime?: string;
  speakers?: Speaker[];
  organizedBy?: "solo" | "community";
  communityName?: string;
  requirementsToAttend?: string;
  whatsIncluded?: string;
  agenda?: string | AgendaItem[];
  organizerName?: string;
}

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<
    "attended" | "created" | "tickets"
  >("attended");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [eventsCreated, setEventsCreated] = useState<Event[]>([]);
  const [eventsAttended, setEventsAttended] = useState<Event[]>([]);
  const [ticketsOwned, setTicketsOwned] = useState<Event[]>([]);
  const [isLoadingCreated, setIsLoadingCreated] = useState(false);
  const [isLoadingAttended, setIsLoadingAttended] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Event | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isViewingEvent, setIsViewingEvent] = useState<number | null>(null);
  const [withdrawalLoading, setWithdrawalLoading] = useState<{
    [key: number]: boolean;
  }>({});
  const [withdrawnEvents, setWithdrawnEvents] = useState<Set<number>>(
    new Set()
  );

  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user);

  const convertIPFSToHTTP = (ipfsUri: string): string => {
    if (ipfsUri?.startsWith("ipfs://")) {
      return ipfsUri.replace(
        "ipfs://",
        "https://lavender-tremendous-deer-798.mypinata.cloud/ipfs/"
      );
    }
    return ipfsUri || "/placeholder.svg";
  };

  const fetchIPFSMetadata = async (
    baseURI: string
  ): Promise<IPFSMetadata | null> => {
    try {
      const httpUrl = convertIPFSToHTTP(baseURI);
      const response = await fetch(httpUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      const metadata: IPFSMetadata = await response.json();
      return metadata;
    } catch (error) {
      console.error("Error fetching IPFS metadata:", error);
      return null;
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return { date: dateStr, time: timeStr };
    } catch (error) {
      return { date: "TBD", time: "TBD" };
    }
  };

  const getCreatedEvents = async () => {
    try {
      setIsLoadingCreated(true);
      setEventsCreated([]);
      const contract = await getContract();
      const events: Event[] = [];

      for (const eventId of currentUser.eventsCreated) {
        console.log("Fetching event details for ID:", eventId);
        const event = await contract.getEventDetails(eventId.toString());
        const metadata = await fetchIPFSMetadata(event.baseURI);
        const dateTime = metadata?.startDateTime
          ? formatDateTime(metadata.startDateTime)
          : { date: "TBD", time: "TBD" };
        const rawBalance = await contract.eventBalances(eventId.toString());
        const withdrawalBalance = Number(formatEther(rawBalance));
        events.push({
          id: Number.parseInt(eventId),
          title: metadata?.eventName || event.name,
          image: metadata?.image
            ? convertIPFSToHTTP(metadata.image)
            : "/placeholder.svg",
          date: dateTime.date,
          time: dateTime.time,
          location: metadata?.location || "TBD",
          price:
            event.ticketPrice.toString() === "0"
              ? "Free"
              : `${(Number(event.ticketPrice) / 1e18).toFixed(3)} ETH`,
          attendees: Number(event.totalTicketsSold),
          category: metadata?.category || "General",
          withdrawalAmount: Number(withdrawalBalance.toFixed(3)),
          status:
            Number(event.totalTicketsSold) >= Number(event.maxTickets)
              ? "Sold Out"
              : "Selling",
          organizer:
            metadata?.organizerName ||
            metadata?.communityName ||
            "Event Organizer",
        });
      }
      setEventsCreated(events);
    } catch (error) {
      console.error("Error fetching created events:", error);
      toast.error("Failed to load created events. Please try again later.");
    } finally {
      setIsLoadingCreated(false);
    }
  };

  const getAttendedEvents = async () => {
    try {
      setIsLoadingAttended(true);
      setEventsAttended([]);
      const contract = await getContract();
      const events: Event[] = [];

      for (const eventId of currentUser.eventsAttended) {
        console.log("Fetching event details for ID:", eventId);
        const event = await contract.getEventDetails(eventId.toString());
        const metadata = await fetchIPFSMetadata(event.baseURI);
        const dateTime = metadata?.startDateTime
          ? formatDateTime(metadata.startDateTime)
          : { date: "TBD", time: "TBD" };

        events.push({
          id: Number.parseInt(eventId),
          title: metadata?.eventName || event.name,
          image: metadata?.image
            ? convertIPFSToHTTP(metadata.image)
            : "/placeholder.svg",
          date: dateTime.date,
          time: dateTime.time,
          location: metadata?.location || "TBD",
          price:
            event.ticketPrice.toString() === "0"
              ? "Free"
              : `${(Number(event.ticketPrice) / 1e18).toFixed(3)} ETH`,
          attendees: Number(event.totalTicketsSold),
          category: metadata?.category || "General",
          status:
            Number(event.totalTicketsSold) >= Number(event.maxTickets)
              ? "Sold Out"
              : "Selling",
          organizer:
            metadata?.organizerName ||
            metadata?.communityName ||
            "Event Organizer",
        });
      }
      setEventsAttended(events);
    } catch (error) {
      console.error("Error fetching attended events:", error);
      toast.error("Failed to load attended events. Please try again later.");
    } finally {
      setIsLoadingAttended(false);
    }
  };
  const getOrganiserDetail = async (walletAddress: string) => {
    try {
      const res = await fetch("/api/returnProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      if (!res.ok) throw new Error("Failed to fetch organizer profile");
      const data = await res.json();
      return data?.profile || null;
    } catch (error) {
      console.error("Error fetching organizer details:", error);
      return null;
    }
  };

  const getOwnedTickets = async () => {
    try {
      setIsLoadingTickets(true);
      setTicketsOwned([]);
      const contract = await getContract();
      const tickets: Event[] = [];

      for (const ticket of currentUser.ticketsOwned) {
        const eventId = await contract.tokenToEvent(ticket.toString());
        const event = await contract.getEventDetails(eventId.toString());
        const metadata = await fetchIPFSMetadata(event.baseURI);
        const dateTime = metadata?.startDateTime
          ? formatDateTime(metadata.startDateTime)
          : { date: "TBD", time: "TBD" };

        let organizerName =
          metadata?.communityName ||
          metadata?.organizerName ||
          "Event Organizer";

        if (metadata?.organizedBy === "solo") {
          const profile = await getOrganiserDetail(event.organizer);
          if (profile?.name) organizerName = profile.name;
        }

        tickets.push({
          id: Number.parseInt(eventId),
          title: metadata?.eventName || event.name,
          ticketId: Number(ticket),
          image: metadata?.image
            ? convertIPFSToHTTP(metadata.image)
            : "/placeholder.svg",
          date: dateTime.date,
          time: dateTime.time,
          location: metadata?.location || "TBD",
          price:
            event.ticketPrice.toString() === "0"
              ? "Free"
              : `${(Number(event.ticketPrice) / 1e18).toFixed(3)} ETH`,
          attendees: Number(event.totalTicketsSold),
          category: metadata?.category || "General",
          status: "Active",
          organizer: organizerName,
        });
      }

      setTicketsOwned(tickets);
    } catch (error) {
      console.error("Error fetching owned tickets:", error);
      toast.error("Failed to load owned tickets. Please try again later.");
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const openTicketModal = (ticket: Event) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  const closeTicketModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const openManageModal = (event: Event) => {
    setSelectedEvent(event);
    setIsManageModalOpen(true);
  };

  const closeManageModal = () => {
    setIsManageModalOpen(false);
    setSelectedEvent(null);
  };

  const handleViewEvent = (eventId: number) => {
    setIsViewingEvent(eventId);
    router.push(`/event/${eventId}`);
  };

  const handleWithdraw = async (eventId: number) => {
    try {
      setWithdrawalLoading((prev) => ({ ...prev, [eventId]: true }));
      const contract = await getContract();
      const tx = await contract.withdrawForEvent(eventId.toString());
      await tx.wait();
      setWithdrawnEvents((prev) => new Set([...prev, eventId]));
      toast.success("Withdrawal completed successfully!");
      closeManageModal();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to withdraw. Please try again.");
    } finally {
      setWithdrawalLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Used":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "Expired":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Live":
        return "bg-green-500 text-white";
      case "Selling":
        return "bg-orange-500 text-white";
      case "Completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  useEffect(() => {
    getAttendedEvents();
    getCreatedEvents();
    getOwnedTickets();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <ProfileSidebar
              isCreatingEvent={isCreatingEvent}
              setIsCreatingEvent={setIsCreatingEvent}
              setIsSettingsOpen={setIsSettingsOpen}
            />
          </div>

          {/* Right Content - Main Dashboard */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-300">
                Manage your events, tickets, and profile
              </p>
            </div>

            {/* Tabs */}
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === "attended" && (
                <EventsAttended
                  eventsAttended={eventsAttended}
                  isLoading={isLoadingAttended}
                />
              )}

              {activeTab === "created" && (
                <EventsCreated
                  eventsCreated={eventsCreated}
                  isLoading={isLoadingCreated}
                  isCreatingEvent={isCreatingEvent}
                  setIsCreatingEvent={setIsCreatingEvent}
                  openManageModal={openManageModal}
                  handleViewEvent={handleViewEvent}
                  isViewingEvent={isViewingEvent}
                />
              )}

              {activeTab === "tickets" && (
                <OwnedTickets
                  ticketsOwned={ticketsOwned}
                  isLoading={isLoadingTickets}
                  openTicketModal={openTicketModal}
                  getStatusColor={getStatusColor}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={currentUser}
      />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={closeTicketModal}
        selectedTicket={selectedTicket}
      />

      <ManageEventModal
        isOpen={isManageModalOpen}
        onClose={closeManageModal}
        selectedEvent={selectedEvent}
        handleWithdraw={handleWithdraw}
        withdrawalLoading={withdrawalLoading}
        withdrawnEvents={withdrawnEvents}
      />
    </div>
  );
}
