"use client"
import { useState } from "react"
import { Upload, Calendar, Tag, Settings, Users, Plus, X, FileText } from "lucide-react"
import { toast } from "sonner"
import { getContract } from "@/contract/contract"
import { useAccount } from "wagmi"
import { parseEther } from "ethers"
import { useAppDispatch } from "@/store/hook"
import { addEventCreated } from "@/store/userSlice"

interface Speaker {
  id: string
  name: string
  image: File | null
  description: string
  email: string
}

interface EventMetadata {
  eventName: string
  description: string
  category: string
  bannerImage: File | null
  location: string
  startDateTime: string
  endDateTime: string
  speakers: Speaker[]
  organizedBy: "solo" | "community"
  communityName?: string
  requirementsToAttend: string
  whatsIncluded: string
  agenda: string
}

interface OnchainData {
  eventName: string
  priceInETH: string
  maxTicketsAvailable: number
  network: string
  isFreeEvent: boolean
}

export default function CreateEventForm() {
  // Form state variables
  const [eventName, setEventName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [bannerImage, setBannerImage] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [startDateTime, setStartDateTime] = useState("")
  const [endDateTime, setEndDateTime] = useState("")
  const [requirementsToAttend, setRequirementsToAttend] = useState("")
  const [whatsIncluded, setWhatsIncluded] = useState("")
  const [agenda, setAgenda] = useState("")
  const [priceInETH, setPriceInETH] = useState("")
  const [maxTicketsAvailable, setMaxTicketsAvailable] = useState<number>(0)
  const [network, setNetwork] = useState("Ethereum Sepolia")
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [speakerPreviews, setSpeakerPreviews] = useState<Record<string, string>>({})
  const [organizedBy, setOrganizedBy] = useState<"solo" | "community">("solo")
  const [communityName, setCommunityName] = useState("")
  const [isFreeEvent, setIsFreeEvent] = useState(false)
  const [loading, setLoading] = useState(false)

  const dispatch = useAppDispatch()

  // Handle banner image upload with preview
  const handleBannerUpload = (file: File | null) => {
    setBannerImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setBannerPreview(null)
    }
  }

  // Handle speaker image upload with preview
  const handleSpeakerImageUpload = (speakerId: string, file: File | null) => {
    updateSpeaker(speakerId, "image", file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSpeakerPreviews((prev) => ({
          ...prev,
          [speakerId]: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    } else {
      setSpeakerPreviews((prev) => {
        const newPreviews = { ...prev }
        delete newPreviews[speakerId]
        return newPreviews
      })
    }
  }

  const addSpeaker = () => {
    const newSpeaker: Speaker = {
      id: Date.now().toString(),
      name: "",
      image: null,
      description: "",
      email: "",
    }
    setSpeakers([...speakers, newSpeaker])
  }

  const removeSpeaker = (id: string) => {
    setSpeakers(speakers.filter((speaker) => speaker.id !== id))
    // Remove preview for deleted speaker
    setSpeakerPreviews((prev) => {
      const newPreviews = { ...prev }
      delete newPreviews[id]
      return newPreviews
    })
  }

  const updateSpeaker = (id: string, field: keyof Speaker, value: string | File | null) => {
    setSpeakers(speakers.map((speaker) => (speaker.id === id ? { ...speaker, [field]: value } : speaker)))
  }

  const validateForm = (): boolean => {
    if (!eventName.trim()) {
      toast.error("Event name is required")
      return false
    }
    if (!category) {
      toast.error("Please select a category")
      return false
    }
    if (!description.trim()) {
      toast.error("Event description is required")
      return false
    }
    if (!location.trim()) {
      toast.error("Event location is required")
      return false
    }
    if (!startDateTime) {
      toast.error("Start date and time is required")
      return false
    }
    if (!endDateTime) {
      toast.error("End date and time is required")
      return false
    }
    if (new Date(startDateTime) >= new Date(endDateTime)) {
      toast.error("End date must be after start date")
      return false
    }
    if (!isFreeEvent && (!priceInETH || Number.parseFloat(priceInETH) <= 0)) {
      toast.error("Please enter a valid ticket price")
      return false
    }
    if (maxTicketsAvailable <= 0) {
      toast.error("Please enter a valid number of tickets")
      return false
    }
    return true
  }

  const handleSubmit = () => {
    // Collect actual form data into metadata structure
    const metadata: EventMetadata = {
      eventName,
      description,
      category,
      bannerImage,
      location,
      startDateTime,
      endDateTime,
      speakers,
      organizedBy,
      communityName: organizedBy === "community" ? communityName : undefined,
      requirementsToAttend,
      whatsIncluded,
      agenda,
    }

    // Collect actual form data into onchain data structure
    const onchainData: OnchainData = {
      eventName,
      priceInETH: isFreeEvent ? "0" : priceInETH,
      maxTicketsAvailable,
      network,
      isFreeEvent,
    }

    return { metadata, onchainData }
  }

  const addDataToIPFS = async (data: EventMetadata): Promise<string> => {
    try {
      const formData = new FormData()
      // Add banner image if exists
      if (data.bannerImage) {
        formData.append("bannerImage", data.bannerImage)
      }
      // Add basic event data
      formData.append("eventName", data.eventName)
      formData.append("description", data.description)
      formData.append("category", data.category)
      formData.append("location", data.location)
      formData.append("startDateTime", data.startDateTime)
      formData.append("endDateTime", data.endDateTime)
      formData.append("organizedBy", data.organizedBy)
      if (data.organizedBy === "community" && data.communityName) {
        formData.append("communityName", data.communityName)
      }
      formData.append("requirementsToAttend", data.requirementsToAttend)
      formData.append("whatsIncluded", data.whatsIncluded)
      formData.append("agenda", data.agenda)

      // Handle speakers data
      const speakersData = data.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        description: speaker.description,
        email: speaker.email,
        hasImage: !!speaker.image,
      }))
      formData.append("speakers", JSON.stringify(speakersData))

      // Add speaker images separately
      data.speakers.forEach((speaker) => {
        if (speaker.image) {
          formData.append(`speakerImage_${speaker.id}`, speaker.image)
        }
      })

      // Call your API endpoint to upload metadata
      const response = await fetch("/api/uploadMetadata", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Failed to upload metadata: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Metadata uploaded successfully:", result.metadataUrl)
      return result.metadataUrl
    } catch (error) {
      console.error("Error uploading data to IPFS:", error)
      throw new Error("Failed to upload data to IPFS")
    }
  }

  const createEvent = async (metadataUrl: string): Promise<number> => {
    try {
      const contract = await getContract()
      const priceInWei = isFreeEvent ? "0" : parseEther(priceInETH).toString()
      const tx = await contract.createEvent(eventName, priceInWei, maxTicketsAvailable, metadataUrl)
      const receipt = await tx.wait()
      let eventId: number | null = null
      for (const log of receipt.logs) {
        if (log.fragment?.name === "EventCreated") {
          eventId = Number(log.args?.[0])
          break
        }
      }
      if (eventId === null) {
        console.error("❌ EventCreated log not found or eventId missing")
        throw new Error("EventCreated log not found")
      }
      return eventId
    } catch (error) {
      console.error("❌ createEvent error:", error)
      throw error
    }
  }

  const { address } = useAccount()

  const addEventIdToDb = async (eventId: number) => {
    const res = await fetch("/api/addEventToDb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        walletAddress: address,
      }),
    })
    dispatch(addEventCreated(eventId.toString()))
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to add event to DB")
  }

  const handleOperations = async () => {
    if (!validateForm()) return
    setLoading(true)
    const loadingToast = toast.loading("Processing event creation...")
    try {
      const { metadata } = handleSubmit()
      toast.loading("Uploading metadata to IPFS...", { id: loadingToast })
      const metadataUrl = await addDataToIPFS(metadata)
      toast.loading("Creating event on blockchain...", { id: loadingToast })
      const eventId = await createEvent(metadataUrl)
      await addEventIdToDb(eventId)
      toast.success("Event created successfully!", { id: loadingToast })
      setEventName("")
      setCategory("")
      setDescription("")
      setBannerImage(null)
      setBannerPreview(null)
      setLocation("")
      setStartDateTime("")
      setEndDateTime("")
      setRequirementsToAttend("")
      setWhatsIncluded("")
      setAgenda("")
      setPriceInETH("")
      setMaxTicketsAvailable(0)
      setNetwork("Ethereum Sepolia")
      setSpeakers([])
      setSpeakerPreviews({})
      setOrganizedBy("solo")
      setCommunityName("")
      setIsFreeEvent(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred", { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

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
          {/* Left Side */}
          <div className="space-y-12">
            {/* Banner Upload */}
            <div className="bg-gray-800/30 rounded-3xl p-10 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center">
                <Upload className="w-6 h-6 mr-3 text-orange-400" />
                Event Banner
              </h2>
              {bannerPreview ? (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden">
                    <img
                      src={bannerPreview || "/placeholder.svg"}
                      alt="Banner preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleBannerUpload(null)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-green-400 text-sm">Selected: {bannerImage?.name}</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-2xl p-16 text-center hover:border-orange-500 transition-colors">
                  <Upload className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                  <p className="text-gray-300 mb-3 text-lg">Drop your banner image here, or click to browse</p>
                  <p className="text-sm text-gray-500 mb-6">Recommended: 1920x1080px, JPG or PNG</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleBannerUpload(e.target.files?.[0] || null)}
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer inline-block"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="bg-gray-800/30 rounded-3xl p-10 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-8 text-white">Basic Information</h2>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Event Name *</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors text-lg"
                    placeholder="Enter event name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#090d12] border border-gray-600 rounded-xl px-6 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors text-lg"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Tech">Tech</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                    <option value="Education">Education</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Festival">Festival</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Description *</label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors resize-none text-lg"
                    placeholder="Describe your event..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Speakers Section */}
            <div className="bg-gray-800/30 rounded-3xl p-10 border border-gray-700/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Users className="w-6 h-6 mr-3 text-orange-400" />
                  Speakers (Optional)
                </h2>
                <button
                  type="button"
                  onClick={addSpeaker}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Speaker
                </button>
              </div>
              {speakers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No speakers added yet. Click "Add Speaker" to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {speakers.map((speaker) => (
                    <div key={speaker.id} className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/50">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">Speaker Details</h3>
                        <button
                          type="button"
                          onClick={() => removeSpeaker(speaker.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                          <input
                            type="text"
                            value={speaker.name}
                            onChange={(e) => updateSpeaker(speaker.id, "name", e.target.value)}
                            className="w-full bg-gray-600/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                            placeholder="Speaker name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Email (Optional)</label>
                          <input
                            type="email"
                            value={speaker.email}
                            onChange={(e) => updateSpeaker(speaker.id, "email", e.target.value)}
                            className="w-full bg-gray-600/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                            placeholder="speaker@email.com"
                          />
                        </div>
                      </div>
                      {/* Speaker Image with Preview */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Speaker Image</label>
                        {speakerPreviews[speaker.id] ? (
                          <div className="flex items-center gap-4">
                            <img
                              src={speakerPreviews[speaker.id] || "/placeholder.svg" || "/placeholder.svg"}
                              alt="Speaker preview"
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-green-400 text-sm mb-2">Image selected</p>
                              <button
                                type="button"
                                onClick={() => handleSpeakerImageUpload(speaker.id, null)}
                                className="text-red-400 hover:text-red-300 text-sm transition-colors"
                              >
                                Remove image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSpeakerImageUpload(speaker.id, e.target.files?.[0] || null)}
                            className="w-full bg-gray-600/50 border border-gray-500 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition-colors"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Short Description</label>
                        <textarea
                          rows={3}
                          value={speaker.description}
                          onChange={(e) => updateSpeaker(speaker.id, "description", e.target.value)}
                          className="w-full bg-gray-600/50 border border-gray-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                          placeholder="Brief description of the speaker..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Organization */}
            <div className="bg-gray-800/30 rounded-3xl p-10 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center">
                <Settings className="w-6 h-6 mr-3 text-orange-400" />
                Organized By
              </h2>
              <div className="space-y-6">
                <div className="flex space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="organizedBy"
                      value="solo"
                      checked={organizedBy === "solo"}
                      onChange={(e) => setOrganizedBy(e.target.value as "solo" | "community")}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                        organizedBy === "solo" ? "border-orange-500 bg-orange-500" : "border-gray-400"
                      }`}
                    >
                      {organizedBy === "solo" && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-white font-medium">Solo</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="organizedBy"
                      value="community"
                      checked={organizedBy === "community"}
                      onChange={(e) => setOrganizedBy(e.target.value as "solo" | "community")}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${
                        organizedBy === "community" ? "border-orange-500 bg-orange-500" : "border-gray-400"
                      }`}
                    >
                      {organizedBy === "community" && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-white font-medium">Community</span>
                  </label>
                </div>
                {organizedBy === "community" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Community Name</label>
                    <input
                      type="text"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors text-lg"
                      placeholder="Enter community name"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side */}
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
                    <label className="block text-sm font-medium text-gray-300 mb-3">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white focus:border-orange-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors text-lg"
                    placeholder="Enter physical address or virtual meeting link"
                    required
                  />
                </div>
              </div>
            </div>

            {/* More Event Details */}
            <div className="bg-gray-800/30 rounded-3xl p-10 border border-gray-700/50">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center">
                <FileText className="w-6 h-6 mr-3 text-orange-400" />
                More Event Details
              </h2>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Requirements to Attend</label>
                  <textarea
                    rows={4}
                    value={requirementsToAttend}
                    onChange={(e) => setRequirementsToAttend(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    placeholder="List any requirements, prerequisites, or items attendees should bring..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">What's Included</label>
                  <textarea
                    rows={4}
                    value={whatsIncluded}
                    onChange={(e) => setWhatsIncluded(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    placeholder="What will attendees receive? (e.g., meals, materials, swag, etc.)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Agenda</label>
                  <textarea
                    rows={4}
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    placeholder="Event schedule and timeline..."
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
                {/* Free Event Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
                  <div>
                    <h3 className="text-white font-medium">Free Event</h3>
                    <p className="text-gray-400 text-sm">Make this event free for all attendees</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFreeEvent}
                      onChange={(e) => setIsFreeEvent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Ticket Price (ETH) *</label>
                    <input
                      type="number"
                      step="0.001"
                      value={isFreeEvent ? "0" : priceInETH}
                      onChange={(e) => setPriceInETH(e.target.value)}
                      disabled={isFreeEvent}
                      className={`w-full border rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors ${
                        isFreeEvent
                          ? "bg-gray-600/30 border-gray-500/50 cursor-not-allowed"
                          : "bg-gray-700/50 border-gray-600"
                      }`}
                      placeholder={isFreeEvent ? "0.000" : "0.05"}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Max Tickets Available *</label>
                    <input
                      type="number"
                      value={maxTicketsAvailable || ""}
                      onChange={(e) => setMaxTicketsAvailable(Number.parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="1000"
                      required
                    />
                  </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Network</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    disabled
                    className="w-full bg-gray-600/30 border border-gray-500/50 rounded-xl px-6 py-4 text-white cursor-not-allowed"
                  >
                    <option value="Ethereum Sepolia">Ethereum Sepolia</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-16">
          <button
            type="submit"
            onClick={handleOperations}
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-12 py-4 text-lg rounded-xl font-medium transition-all duration-200"
          >
            {loading ? "Creating Event..." : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  )
}
