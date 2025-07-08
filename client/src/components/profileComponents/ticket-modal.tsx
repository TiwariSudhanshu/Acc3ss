"use client"

import { X, Download } from "lucide-react"
import { useRef } from "react"
import { toPng } from "html-to-image"
import TicketComponent from "../ticket"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"

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

interface TicketModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTicket: Event | null
}

export default function TicketModal({ isOpen, onClose, selectedTicket }: TicketModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null)
  const currentUser = useSelector((state: RootState) => state.user)

  if (!isOpen || !selectedTicket) return null

  const handleDownload = async () => {
    if (!ticketRef.current) return
    try {
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
      })
      const link = document.createElement("a")
      link.download = `ticket-${selectedTicket.title?.replace(/\s+/g, "-").toLowerCase()}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Failed to export image", error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Event Ticket</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              title="Download Ticket"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6" ref={ticketRef}>
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
  )
}
