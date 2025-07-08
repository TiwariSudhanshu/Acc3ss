"use client"

import { Calendar, MapPin, Ticket } from "lucide-react"

interface Event {
  id: number
  title: string
  image: string
  date: string
  time: string
  location: string
  price: string
  attendees: number
  category: string
  status: string
  organizer: string
  ticketId?: number
}

interface OwnedTicketsProps {
  ticketsOwned: Event[]
  isLoading: boolean
  openTicketModal: (ticket: Event) => void
  getStatusColor: (status: string) => string
}

export default function OwnedTickets({ ticketsOwned, isLoading, openTicketModal, getStatusColor }: OwnedTicketsProps) {
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Ticket className="w-5 h-5 mr-2 text-orange-400" />
            Owned Tickets (...)
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="w-24 h-8 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Ticket className="w-5 h-5 mr-2 text-orange-400" />
          Owned Tickets ({ticketsOwned.length})
        </h2>
      </div>
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
        {ticketsOwned.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-gray-800/50 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all duration-300 p-4"
          >
            <div className="flex items-start space-x-4">
              <img
                src={ticket.image || "/placeholder.svg"}
                alt={ticket.title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white text-lg truncate pr-2">{ticket.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getStatusColor(
                      ticket.status,
                    )}`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                    <span className="truncate">{ticket.date}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                    <span className="truncate">{ticket.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">Price:</span>
                    <span className="text-white font-semibold">{ticket.price}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openTicketModal(ticket)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex-1"
                  >
                    Open Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
