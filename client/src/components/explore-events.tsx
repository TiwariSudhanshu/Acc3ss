"use client";
import { Calendar, MapPin, Users, Search, Plus, User } from "lucide-react";
import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { getContract } from "@/contract/contract";
import { toast } from "sonner";
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
  description?: string;
  organizer?: string;
  maxTickets?: number;
  totalTicketsSold?: number;
  startDateTime?: string;
  endDateTime?: string;
  organizedBy?: string;
}

interface RootState {
  user: {
    profilePicture?: string;
    name?: string;
  };
}

interface IPFSMetadata {
  eventName: string;
  description: string;
  category: string;
  bannerImage: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  organizedBy: string;
}

export default function ExploreEvents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isNavigatingToProfile, setIsNavigatingToProfile] = useState(false);

  // Get profile picture from Redux
  const userProfile = useSelector((state: RootState) => state.user);

  // Convert IPFS URI to HTTP URL
  const convertIPFSToHTTP = (ipfsUri: string): string => {
    if (ipfsUri?.startsWith("ipfs://")) {
      return ipfsUri.replace(
        "ipfs://",
        "https://lavender-tremendous-deer-798.mypinata.cloud/ipfs/"
      );
    }
    return ipfsUri || "/placeholder.svg";
  };

  // Fetch IPFS metadata
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

  // Format date and time from ISO string
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
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

  // Determine event status
  const getEventStatus = (
    startDateTime?: string,
    endDateTime?: string,
    totalSold?: number,
    maxTickets?: number
  ) => {
    if (!startDateTime) return "Coming Soon";

    const now = new Date();
    const start = new Date(startDateTime);
    const end = endDateTime ? new Date(endDateTime) : null;

    if (now >= start && (!end || now <= end)) {
      return "Live";
    } else if (end && now > end) {
      return "Ended";
    } else if (maxTickets && totalSold && totalSold >= maxTickets) {
      return "Sold Out";
    } else {
      return "Selling";
    }
  };

  async function getEvents() {
    setLoading(true);

    try {
      const contract = await getContract();
      const lastIdBn = await contract.nextEventId();
      const lastId = Number(lastIdBn);

      const cached = localStorage.getItem("events");
      const cachedEvents: Event[] = cached
        ? JSON.parse(cached).map((event: any) => ({
            ...event,
            image: convertIPFSToHTTP(event.banner || event.image),
          }))
        : [];

      setEvents(cachedEvents);

      const newEvents: Event[] = [];

      for (let i = cachedEvents.length; i < lastId; i++) {
        try {
          const eventData = await contract.getEventDetails(i.toString());
          const [
            name,
            ticketPrice,
            maxTickets,
            totalTicketsSold,
            baseURI,
            organizer,
          ] = eventData;

          // Fetch IPFS metadata
          const metadata = await fetchIPFSMetadata(baseURI);

          if (metadata) {
            // Format date and time
            const { date, time } = formatDateTime(metadata.startDateTime);

            // Convert ticket price from wei to ETH
            const priceInETH = formatEther(ticketPrice);

            // Determine event status
            const status = getEventStatus(
              metadata.startDateTime,
              metadata.endDateTime,
              Number(totalTicketsSold),
              Number(maxTickets)
            );

            // Construct complete event object with proper defaults
            const completeEvent: Event = {
              id: i,
              title: metadata.eventName || name || "Untitled Event",
              image: convertIPFSToHTTP(metadata.bannerImage),
              date,
              time,
              location: metadata.location || "TBD",
              price: priceInETH === "0.0" ? "Free" : `${priceInETH} ETH`,
              attendees: Number(totalTicketsSold) || 0,
              category: metadata.category || "General",
              status,
              description: metadata.description,
              organizer,
              maxTickets: Number(maxTickets) || 0,
              totalTicketsSold: Number(totalTicketsSold) || 0,
              startDateTime: metadata.startDateTime,
              endDateTime: metadata.endDateTime,
              organizedBy: metadata.organizedBy,
            };

            newEvents.push(completeEvent);
          } else {
            // Fallback if IPFS metadata fails
            const fallbackEvent: Event = {
              id: i,
              title: name || "Untitled Event",
              image: "/placeholder.svg?height=200&width=400",
              date: "TBD",
              time: "TBD",
              location: "TBD",
              price:
                formatEther(ticketPrice) === "0.0"
                  ? "Free"
                  : `${formatEther(ticketPrice)} ETH`,
              attendees: Number(totalTicketsSold) || 0,
              category: "General",
              status: "Coming Soon",
              organizer,
              maxTickets: Number(maxTickets) || 0,
              totalTicketsSold: Number(totalTicketsSold) || 0,
            };

            newEvents.push(fallbackEvent);
          }
        } catch (eventError) {
          console.error(`Error fetching event ${i}:`, eventError);
          // Continue with next event instead of showing toast for each error
        }
      }

      // Merge cached and new events
      const mergedEvents = [...cachedEvents, ...newEvents];
      setEvents(mergedEvents);
      localStorage.setItem("events", JSON.stringify(mergedEvents));

      if (newEvents.length > 0) {
        toast.success(
          `Successfully loaded ${newEvents.length} new events from blockchain!`
        );
      } else if (mergedEvents.length === 0) {
        toast.info("No events found on the blockchain yet.");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const refreshEvents = async () => {
    localStorage.removeItem("events");
    setEvents([]);
    await getEvents();
  };

  useEffect(() => {
    getEvents();
  }, []);

  // Filter events based on search term and category
  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      event.title.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      event.category.toLowerCase().includes(searchLower) ||
      event.date.toLowerCase().includes(searchLower);

    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle event card click - redirect to event detail page
  const handleEventClick = (eventId: number) => {
    router.push(`/event/${eventId}`);
  };

  // Handle get ticket button click - redirect to event detail page
  const handleGetTicketClick = (eventId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event card click
    router.push(`/event/${eventId}`);
  };

  const handleCreateEvent = async () => {
    setIsCreatingEvent(true);
    router.push("/create");
  };

  const handleProfileClick = async () => {
    setIsNavigatingToProfile(true);
    router.push("/profile");
  };

  const categories = [
    "All",
    "Tech",
    "Art",
    "Music",
    "Education",
    "Gaming",
    "Conference",
    "Workshop",
    "Meetup",
    "Festival",
    "Sports",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header with Profile and Create Event */}
        <div className="flex items-center justify-between mb-8">
          <div className=" flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Explore Events
            </h1>
            <p className="text-xl text-gray-300">
              Discover amazing Web3 events happening around the world
            </p>
          </div>

          {/* Profile Picture and Create Event Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCreateEvent}
              disabled={isCreatingEvent}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isCreatingEvent
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              }`}
            >
              <Plus className="w-5 h-5" />
              {isCreatingEvent ? "Creating..." : "Create Event"}
            </button>

            <button
              onClick={handleProfileClick}
              disabled={isNavigatingToProfile}
              className={`w-12 h-12 cursor-pointer rounded-full border-2 transition-colors overflow-hidden ${
                isNavigatingToProfile
                  ? "border-gray-600 opacity-50 cursor-not-allowed"
                  : "border-orange-500 hover:border-orange-400"
              }`}
            >
              {userProfile?.profilePicture ? (
                <img
                  src={userProfile.profilePicture || "/placeholder.svg"}
                  alt={userProfile.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                disabled={loading}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === selectedCategory
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Info */}
        {(searchTerm || selectedCategory !== "All") && (
          <div className="mb-6">
            <p className="text-gray-300">
              {filteredEvents.length === 0
                ? `No events found${searchTerm ? ` for "${searchTerm}"` : ""}${
                    selectedCategory !== "All" ? ` in ${selectedCategory}` : ""
                  }`
                : `Found ${filteredEvents.length} event${
                    filteredEvents.length !== 1 ? "s" : ""
                  }${searchTerm ? ` for "${searchTerm}"` : ""}${
                    selectedCategory !== "All" ? ` in ${selectedCategory}` : ""
                  }`}
            </p>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading events onchain...</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-orange-500/50 transition-all duration-300 group cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === "Live"
                          ? "bg-green-500 text-white"
                          : event.status === "Selling"
                          ? "bg-orange-500 text-white"
                          : event.status === "Sold Out"
                          ? "bg-red-500 text-white"
                          : "bg-gray-600 text-gray-200"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/50 text-white">
                      {event.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-300 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                      {event.date} at {event.time}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <Users className="w-4 h-4 mr-2 text-orange-400" />
                      {(event.attendees || 0).toLocaleString()} /{" "}
                      {(event.maxTickets || 0).toLocaleString()} tickets
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">
                      {event.price}
                    </div>
                    <button
                      onClick={(e) => handleGetTicketClick(event.id, e)}
                      disabled={
                        event.status === "Sold Out" || event.status === "Ended"
                      }
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                        event.status === "Sold Out" || event.status === "Ended"
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                      }`}
                    >
                      {event.status === "Sold Out"
                        ? "Sold Out"
                        : event.status === "Ended"
                        ? "Ended"
                        : "Get Ticket"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {events.length === 0
                ? "No events available on the blockchain yet"
                : "No events found matching your criteria"}
            </div>
            {(searchTerm || selectedCategory !== "All") && (
              <div className="flex gap-4 justify-center">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Clear search
                  </button>
                )}
                {selectedCategory !== "All" && (
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Show all categories
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Load More - only show if there are results and no filters applied */}
        {filteredEvents.length > 0 &&
          !searchTerm &&
          selectedCategory === "All" && (
            <div className="text-center mt-12">
              <button
                onClick={refreshEvents}
                disabled={loading}
                className="border border-gray-600 text-white hover:bg-gray-800 px-8 py-3 text-lg bg-transparent rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh Events Onchain"}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
