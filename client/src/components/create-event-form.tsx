import { Upload, Calendar, Tag, Settings } from "lucide-react"

export default function CreateEventForm() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Create Your Event
          </h1>
          <p className="text-xl text-gray-300">Launch your Web3 event with NFT-based tickets</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Side - Event Details */}
          <div className="space-y-12">
            {/* Banner Upload */}
            <div className="bg-gray-800/30 rounded-3xl p-10 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center">
                <Upload className="w-6 h-6 mr-3 text-orange-400" />
                Event Banner
              </h2>
              <div className="border-2 border-dashed border-gray-600 rounded-2xl p-16 text-center hover:border-orange-500 transition-colors">
                <Upload className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                <p className="text-gray-300 mb-3 text-lg">Drop your banner image here, or click to browse</p>
                <p className="text-sm text-gray-500 mb-6">Recommended: 1920x1080px, JPG or PNG</p>
                <input type="file" className="hidden" accept="image/*" />
                <button
                  type="button"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Choose File
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-gray-800/30 rounded-3xl p-10 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-8 text-white">Basic Information</h2>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Event Title</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors text-lg"
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Category</label>
                  <select className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors text-lg">
                    <option>Select category</option>
                    <option>Conference</option>
                    <option>Concert</option>
                    <option>Workshop</option>
                    <option>Meetup</option>
                    <option>Festival</option>
                    <option>Sports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Description</label>
                  <textarea
                    rows={5}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors resize-none text-lg"
                    placeholder="Describe your event..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Configuration */}
          <div className="space-y-12">
            {/* Date & Location */}
            <div className="bg-gray-800/30 rounded-3xl p-10 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-orange-400" />
                Date & Location
              </h2>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Start Date</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">End Date</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Venue</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors text-lg"
                    placeholder="Enter venue name and address"
                  />
                </div>
              </div>
            </div>

            {/* Ticketing */}
            <div className="bg-gray-800/30 rounded-3xl p-10 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center">
                <Tag className="w-6 h-6 mr-3 text-orange-400" />
                Ticketing
              </h2>
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Price (ETH)</label>
                    <input
                      type="number"
                      step="0.001"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="0.05"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Supply</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Max/Wallet</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Sale Start Date</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Blockchain Settings */}
            <div className="bg-gray-800/30 rounded-3xl p-10 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center">
                <Settings className="w-6 h-6 mr-3 text-orange-400" />
                Blockchain Settings
              </h2>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Network</label>
                    <select className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors">
                      <option>Ethereum Mainnet</option>
                      <option>Polygon</option>
                      <option>Base</option>
                      <option>Arbitrum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Royalty (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="2.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-16">
          <button
            type="button"
            className="border border-gray-600 text-white hover:bg-gray-800 px-12 py-4 text-lg bg-transparent rounded-xl font-medium transition-all duration-200"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-12 py-4 text-lg rounded-xl font-medium transition-all duration-200"
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  )
}
