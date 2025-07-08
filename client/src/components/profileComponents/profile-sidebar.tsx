"use client"

import { Plus, Settings, Bookmark } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { useRouter } from "next/navigation"

interface ProfileSidebarProps {
  isCreatingEvent: boolean
  setIsCreatingEvent: (value: boolean) => void
  setIsSettingsOpen: (value: boolean) => void
}

export default function ProfileSidebar({
  isCreatingEvent,
  setIsCreatingEvent,
  setIsSettingsOpen,
}: ProfileSidebarProps) {
  const router = useRouter()
  const currentUser = useSelector((state: RootState) => state.user)

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 py-10 border border-gray-700 sticky top-8">
      {/* Profile Picture */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <img
            src={currentUser.profilePicture || "/placeholder.svg"}
            alt={currentUser.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-orange-500/30"
          />
        </div>
      </div>

      {/* User Info */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-1">{currentUser.name}</h2>
        <p className="text-gray-400 text-sm mb-3">{currentUser.email}</p>
        <div className="bg-gray-700/50 rounded-lg p-2 mb-3">
          <p className="text-[9px] text-gray-300 font-mono">{currentUser.walletAddress}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Events Attended</span>
          <span className="text-white font-semibold">{currentUser.eventsAttended.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Tickets Owned</span>
          <span className="text-white font-semibold">{currentUser.ticketsOwned.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Events Created</span>
          <span className="text-white font-semibold">{currentUser.eventsCreated.length}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => {
            setIsCreatingEvent(true)
            router.push("/create")
          }}
          disabled={isCreatingEvent}
          className={`w-full ${
            isCreatingEvent ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center`}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreatingEvent ? "Creating..." : "Create Event"}
        </button>

    
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </button>
      </div>
    </div>
  )
}
