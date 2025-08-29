"use client";

import { Calendar, MapPin, Users, Star, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

interface EventsCreatedProps {
  eventsCreated: Event[];
  isLoading: boolean;
  isCreatingEvent: boolean;
  setIsCreatingEvent: (value: boolean) => void;
  openManageModal: (event: Event) => void;
  handleViewEvent: (eventId: number) => void;
  isViewingEvent: number | null;
}

export default function EventsCreated({
  eventsCreated,
  isLoading,
  isCreatingEvent,
  setIsCreatingEvent,
  openManageModal,
  handleViewEvent,
  isViewingEvent,
}: EventsCreatedProps) {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center flex-shrink min-w-0">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-orange-400 flex-shrink-0" />
          <span className="truncate">
            Events Created ({eventsCreated.length})
          </span>
        </h2>

        <button
          onClick={() => {
            setIsCreatingEvent(true);
            router.push("/create");
          }}
          disabled={isCreatingEvent}
          className={`${
            isCreatingEvent ? "opacity-50 cursor-not-allowed" : ""
          } bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 
       text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 
       flex items-center justify-center text-sm sm:text-base whitespace-nowrap flex-shrink-0`}
        >
          <Plus className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">
            {isCreatingEvent ? "Creating..." : "Create New Event"}
          </span>
          <span className="xs:hidden">
            {isCreatingEvent ? "Creating..." : "Create"}
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 animate-pulse"
            >
              <div className="w-full h-32 bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                <div className="flex gap-2 mt-3">
                  <div className="h-8 bg-gray-700 rounded flex-1"></div>
                  <div className="h-8 bg-gray-700 rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {eventsCreated.map((event) => (
            <div
              key={event.id}
              className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-orange-500/50 transition-all duration-300"
            >
              <div className="relative">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  width={800}
                  height={128}
                  className="w-full h-32 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2">{event.title}</h3>
                <div className="space-y-1 text-sm text-gray-300 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                    {event.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                    {event.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-orange-400" />
                    {event.attendees} registered
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openManageModal(event)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm transition-colors"
                  >
                    Manage
                  </button>
                  <button
                    onClick={() => handleViewEvent(event.id)}
                    disabled={isViewingEvent === event.id}
                    className={`flex-1 ${
                      isViewingEvent === event.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    } bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm transition-colors`}
                  >
                    {isViewingEvent === event.id ? "Loading..." : "View"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
