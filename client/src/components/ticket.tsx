"use client"
import { useEffect, useState } from "react"
import { Calendar, MapPin, User, Wallet, Shield } from "lucide-react"
import QRCode from "qrcode"
import { toast } from "sonner"

interface TicketProps {
  eventId?: string | null
  eventTitle: string
  eventBanner: string
  eventDate: string
  eventTime: string
  location: string
  organizerName: string
  price: string
  userName?: string
  userWallet?: string
}

export default function Ticket({
  eventId = null,
  eventTitle,
  eventBanner,
  eventDate,
  eventTime,
  location,
  organizerName,
  price,
  userName = "--",
  userWallet = "0x1234...5678",
}: TicketProps) {
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrPattern, setQrPattern] = useState<boolean[][] | null>(null)

  const generateQRPattern = () => {
    const size = 12
    const pattern = []
    for (let i = 0; i < size; i++) {
      const row = []
      for (let j = 0; j < size; j++) {
        row.push(Math.random() > 0.5)
      }
      pattern.push(row)
    }
    return pattern
  }

  const encryptTicket = async (walletAddress: string, ticketId: string): Promise<string> => {
    const plaintext = `${walletAddress}-${ticketId}`
    const secret = process.env.NEXT_PUBLIC_QR_SECRET_KEY
    if (!secret || secret.length !== 32) {
      throw new Error("Invalid or missing encryption key.")
    }
    const keyMaterial = new TextEncoder().encode(secret)
    const cryptoKey = await window.crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, [
      "encrypt",
      "decrypt",
    ])
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encodedText = new TextEncoder().encode(plaintext)
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      encodedText,
    )
    const encryptedBytes = new Uint8Array(encryptedBuffer)
    const combined = new Uint8Array(iv.length + encryptedBytes.length)
    combined.set(iv)
    combined.set(encryptedBytes, iv.length)
    return btoa(String.fromCharCode(...combined))
  }

  const generateQR = async () => {
    if (!eventId || eventId === "null") {
      setQrImage(null)
      setQrPattern(generateQRPattern())
      return
    }
    try {
      const encrypted = await encryptTicket(userWallet, eventId)
      const qr = await QRCode.toDataURL(encrypted, {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 500,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
      setQrImage(qr)
    } catch (err) {
      console.error("QR Gen Failed:", err)
      toast.error("QR generation failed")
      setQrImage(null)
    }
  }

  useEffect(() => {
    generateQR()
  }, [eventId])

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      {/* Container that scales the entire ticket proportionally */}
      <div className="relative transform scale-50 origin-center sm:scale-60 md:scale-75 lg:scale-90 xl:scale-100 transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl blur-xl -z-10 scale-105"></div>
        <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden border border-gray-600/30 shadow-2xl h-96 w-[960px] mx-auto">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]"></div>
          </div>
          <div className="relative flex h-full">
            {/* Left section - Event banner */}
            <div className="w-1/3 relative overflow-hidden">
              <img
                src={eventBanner || "/placeholder.svg?height=384&width=400"}
                alt={eventTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-900/20 to-gray-900/60"></div>
            </div>
            {/* Middle section - Event details */}
            <div className="w-1/3 p-6 relative flex flex-col justify-between overflow-hidden">
              <div className="mb-4">
                <div className="flex items-center relative justify-between mb-3">
                 
                  <div className="w-8 h-8 absolute right-0 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                    <img src="/favicon.png" alt="Logo" className="w-5 h-5 object-contain" />
                  </div>
                </div>
                <h1 className="text-xl font-bold text-white mb-2 leading-tight line-clamp-2">{eventTitle}</h1>
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  <p className="text-gray-300 text-xs truncate">
                    Organized by <span className="text-orange-400 font-medium">{organizerName}</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="group">
                  <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-700/20 border border-gray-600/30 group-hover:border-orange-500/30 transition-all duration-300">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-md flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-3 h-3 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Date & Time</p>
                      <p className="text-white font-semibold text-xs truncate">{eventDate} {eventTime}</p>
                    </div>
                  </div>
                </div>
                <div className="group">
                  <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-700/20 border border-gray-600/30 group-hover:border-orange-500/30 transition-all duration-300">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-md flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3 h-3 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Venue</p>
                      <p className="text-white font-semibold text-xs truncate">{location}</p>
                    </div>
                  </div>
                </div>
                <div className="group">
                  <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-700/20 border border-gray-600/30 group-hover:border-orange-500/30 transition-all duration-300">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-md flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Attendee</p>
                      <p className="text-white font-semibold text-xs truncate">{userName}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-700/20 border border-gray-600/30">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-md flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-3 h-3 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">Wallet</p>
                    <p className="text-white font-semibold font-mono text-xs truncate">{userWallet}</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
            </div>
            {/* Right section - QR Code */}
            <div className="w-1/3 p-6 flex flex-col items-center justify-center relative">
              <div className="relative">
                <div className="mb-3 text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Verification Code</p>
                  <p className="text-orange-400 text-xs font-semibold">Scan to Verify</p>
                </div>
                {qrImage ? (
                  <div className="relative">
                    <img
                      src={qrImage || "/placeholder.svg"}
                      alt="QR Code"
                      className="w-50 h-50 rounded-xl border-2 border-gray-300 p-2 bg-white object-contain shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ) : qrPattern ? (
                  <div className="relative">
                    <div className="grid grid-cols-12 gap-[1px] w-32 h-32 bg-white p-2 rounded-xl border-2 border-gray-300 shadow-lg">
                      {qrPattern.flat().map((cell, i) => (
                        <div key={i} className={`w-full aspect-square rounded-[1px] ${cell ? "bg-black" : "bg-white"}`} />
                      ))}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-gray-300 animate-pulse shadow-lg" />
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-gray-500 text-xs">Secured by blockchain technology</p>
              </div>
            </div>
          </div>
          {/* Decorative perforations */}
          <div className="absolute left-1/3 top-0 bottom-0 w-px">
            <div className="h-full bg-gradient-to-b from-gray-600/50 via-gray-500/30 to-gray-600/50 relative">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-gray-800 rounded-full border border-gray-600/50 -translate-x-1.5 shadow-lg"
                  style={{ top: `${(i + 1) * 8}%` }}
                />
              ))}
            </div>
          </div>
          <div className="absolute left-2/3 top-0 bottom-0 w-px">
            <div className="h-full bg-gradient-to-b from-gray-600/50 via-gray-500/30 to-gray-600/50 relative">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-gray-800 rounded-full border border-gray-600/50 -translate-x-1.5 shadow-lg"
                  style={{ top: `${(i + 1) * 8}%` }}
                />
              ))}
            </div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-red-600 to-orange-500"></div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-red-600 to-orange-500"></div>
        </div>
      </div>
    </div>
  )
}