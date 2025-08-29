"use client";

import { Calendar, MapPin, Trophy } from "lucide-react";
import Image from "next/image";

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

interface EventsAttendedProps {
  eventsAttended: Event[];
  isLoading: boolean;
}

export default function EventsAttended({
  eventsAttended,
  isLoading,
}: EventsAttendedProps) {
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-orange-400" />
            Events Attended (...)
          </h2>
        </div>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-orange-400" />
          Events Attended ({eventsAttended.length})
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {eventsAttended.map((event) => (
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
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-orange-400" />
                  {event.date}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-orange-400" />
                  {event.location}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
