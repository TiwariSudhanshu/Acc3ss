"use client"

interface ProfileTabsProps {
  activeTab: "attended" | "created" | "tickets"
  setActiveTab: (tab: "attended" | "created" | "tickets") => void
}

export default function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
  return (
    <div className="flex space-x-1 mb-8 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
      <button
        onClick={() => setActiveTab("attended")}
        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
          activeTab === "attended"
            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
            : "text-gray-300 hover:text-white hover:bg-gray-700"
        }`}
      >
        Events Attended
      </button>
      <button
        onClick={() => setActiveTab("created")}
        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
          activeTab === "created"
            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
            : "text-gray-300 hover:text-white hover:bg-gray-700"
        }`}
      >
        Events Created
      </button>
      <button
        onClick={() => setActiveTab("tickets")}
        className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
          activeTab === "tickets"
            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
            : "text-gray-300 hover:text-white hover:bg-gray-700"
        }`}
      >
        Owned Tickets
      </button>
    </div>
  )
}
