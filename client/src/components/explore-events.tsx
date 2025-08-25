"use client";

import { Calendar, MapPin, Users, Search, Plus, User } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";

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

interface APIEvent {
  eventId: string;
  hash: string;
  organizer: string;
  chainId: string;
  eventName: string;
  ticketPrice: string;
  description: string;
  category: string;
  image: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  organizedBy: string;
  requirementsToAttend: string;
  whatsIncluded: string;
  agenda: string;
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

  // Format date and time from string
  const formatDateTime = (dateTimeString: string) => {
    try {
      if (dateTimeString.includes("Invalid Date")) {
        return { date: "TBD", time: "TBD" };
      }
      const normalized = dateTimeString.replace(" at ", " ");
      const date = new Date(normalized);
      if (isNaN(date.getTime())) {
        return { date: "TBD", time: "TBD" };
      }
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
  const getEventStatus = (startDateTime?: string, endDateTime?: string) => {
    if (!startDateTime || startDateTime.includes("Invalid Date"))
      return "Coming Soon";

    try {
      const now = new Date();
      const start = new Date(startDateTime);
      const end =
        endDateTime && !endDateTime.includes("Invalid Date")
          ? new Date(endDateTime)
          : null;

      if (isNaN(start.getTime())) return "Coming Soon";

      if (now >= start && (!end || now <= end)) {
        return "Live";
      } else if (end && now > end) {
        return "Ended";
      } else {
        return "Selling";
      }
    } catch (error) {
      return "Coming Soon";
    }
  };

  async function getEvents() {
    setLoading(true);
    try {
      const response = await fetch("/api/getAllEvents");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const apiEvents: APIEvent[] = await response.json();

      const formattedEvents: Event[] = apiEvents.map((apiEvent) => {
        const { date, time } = formatDateTime(apiEvent.startDateTime);
        const status = getEventStatus(
          apiEvent.startDateTime,
          apiEvent.endDateTime
        );

        return {
          id: Number.parseInt(apiEvent.eventId),
          title: apiEvent.eventName || "Untitled Event",
          image: apiEvent.image || "/placeholder.svg?height=200&width=400",
          date,
          time,
          location: apiEvent.location || "TBD",
          price: apiEvent.ticketPrice,
          attendees: 0, // Default since API doesn't provide attendee info
          category: apiEvent.category || "General",
          status,
          description: apiEvent.description,
          organizer: apiEvent.organizer,
          maxTickets: 0, // Default since API doesn't provide this info
          totalTicketsSold: 0, // Default since API doesn't provide this info
          startDateTime: apiEvent.startDateTime,
          endDateTime: apiEvent.endDateTime,
          organizedBy: apiEvent.organizedBy,
        };
      });

      setEvents(formattedEvents);

      if (formattedEvents.length === 0) {
        toast.info("No events found.");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getEvents();
  }, []);

  // Sort events: sooner events first, ended events last
  const sortEvents = (events: Event[]) => {
    return events.sort((a, b) => {
      // First, sort by status - ended events go to the bottom
      if (a.status === "Ended" && b.status !== "Ended") return 1;
      if (b.status === "Ended" && a.status !== "Ended") return -1;

      // If both are ended or both are not ended, sort by date (sooner events first)
      if (a.startDateTime && b.startDateTime) {
        const dateA = new Date(a.startDateTime);
        const dateB = new Date(b.startDateTime);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateA.getTime() - dateB.getTime();
        }
      }

      // If one has no date, put it at the end
      if (!a.startDateTime && b.startDateTime) return 1;
      if (a.startDateTime && !b.startDateTime) return -1;

      // If neither has a date, maintain original order
      return 0;
    });
  };

  // Filter and sort events based on search term and category
  const filteredEvents = sortEvents(
    events.filter((event) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        event.title.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        event.category.toLowerCase().includes(searchLower) ||
        event.date.toLowerCase().includes(searchLower);

      const matchesCategory =
        selectedCategory === "All" || event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
  );

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
        <div className="mb-8">
          {/* Mobile Layout */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Explore Events
              </h1>
              <button
                onClick={handleProfileClick}
                disabled={isNavigatingToProfile}
                className={`w-10 h-10 rounded-full border-2 transition-colors overflow-hidden flex-shrink-0 ${
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
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </button>
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              Discover amazing Web3 events happening around the world
            </p>
            <button
              onClick={handleCreateEvent}
              disabled={isCreatingEvent}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isCreatingEvent
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              }`}
            >
              <Plus className="w-5 h-5" />
              {isCreatingEvent ? "Creating..." : "Create Event"}
            </button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Explore Events
              </h1>
              <p className="text-xl text-gray-300">
                Discover amazing Web3 events happening around the world
              </p>
            </div>

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
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex flex-wrap items-center gap-3">
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
              <p className="text-white text-lg">Loading events...</p>
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
                      {event.price} Eth
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
                ? "No events available yet"
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
      </div>
    </div>
  );
}
