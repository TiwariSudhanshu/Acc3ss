"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, User, Wallet, Shield } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";

interface TicketProps {
  eventId?: string | null;
  eventTitle: string;
  eventBanner: string;
  eventDate: string;
  eventTime: string;
  location: string;
  organizerName: string;
  price: string;
  userName?: string;
  userWallet?: string;
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
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrPattern, setQrPattern] = useState<boolean[][] | null>(null);

  const generateQRPattern = () => {
    const size = 8;
    const pattern = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        row.push(Math.random() > 0.5);
      }
      pattern.push(row);
    }
    return pattern;
  };

  const encryptTicket = async (
    walletAddress: string,
    ticketId: string
  ): Promise<string> => {
    const plaintext = `${walletAddress}-${ticketId}`;
    const secret = process.env.NEXT_PUBLIC_QR_SECRET_KEY;
    if (!secret || secret.length !== 32) {
      throw new Error("Invalid or missing encryption key.");
    }

    const keyMaterial = new TextEncoder().encode(secret);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(plaintext);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      encodedText
    );

    const encryptedBytes = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.length + encryptedBytes.length);
    combined.set(iv);
    combined.set(encryptedBytes, iv.length);

    return btoa(String.fromCharCode(...combined));
  };

  const generateQR = async () => {
    if (!eventId || eventId === "null") {
      setQrImage(null);
      setQrPattern(generateQRPattern());
      return;
    }

    try {
      const encrypted = await encryptTicket(userWallet, eventId);
      const qr = await QRCode.toDataURL(encrypted, {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrImage(qr);
    } catch (err) {
      console.error("QR Gen Failed:", err);
      toast.error("QR generation failed");
      setQrImage(null);
    }
  };

  useEffect(() => {
    generateQR();
  }, [eventId]);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-2xl blur-xl -z-10 scale-105"></div>

      <div className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden border border-gray-600/30 shadow-2xl h-96">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]"></div>
        </div>

        <div className="relative flex h-full">
          <div className="w-2/5 relative overflow-hidden">
            <img
              src={eventBanner || "/placeholder.svg?height=384&width=400"}
              alt={eventTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-900/20 to-gray-900/60"></div>
          </div>

          <div className="flex-1 p-6 relative flex flex-col justify-between">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                  <span className="text-orange-400 text-xs font-semibold tracking-wider uppercase">
                    Blockchain Ticket
                  </span>
                </div>
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                  <img
                    src="/favicon.png"
                    alt="Logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
                {eventTitle}
              </h1>
              <div className="flex items-center space-x-2">
                <Shield className="w-3 h-3 text-blue-400" />
                <p className="text-gray-300 text-sm">
                  Organized by{" "}
                  <span className="text-orange-400 font-medium">
                    {organizerName}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="group">
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-700/20 border border-gray-600/30 group-hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-md flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Date
                    </p>
                    <p className="text-white font-semibold text-sm truncate">
                      {eventDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-700/20 border border-gray-600/30 group-hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-md flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Time
                    </p>
                    <p className="text-white font-semibold text-sm truncate">
                      {eventTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-700/20 border border-gray-600/30 group-hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-md flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Venue
                    </p>
                    <p className="text-white font-semibold text-sm truncate">
                      {location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-700/20 border border-gray-600/30 group-hover:border-orange-500/30 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-md flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Attendee
                    </p>
                    <p className="text-white font-semibold text-sm truncate">
                      {userName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-gray-700/20 border border-gray-600/30">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-md flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Wallet
                    </p>
                    <p className="text-white font-semibold font-mono text-sm truncate">
                      {userWallet}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  {qrImage ? (
                    <img
                      src={qrImage}
                      alt="QR"
                      className="w-16 h-16 rounded-lg border border-gray-300 p-1 bg-white object-contain"
                    />
                  ) : qrPattern ? (
                    <div className="grid grid-cols-8 gap-[1px] w-16 h-16 bg-white p-1 rounded-lg border border-gray-300">
                      {qrPattern.flat().map((cell, i) => (
                        <div
                          key={i}
                          className={`w-full aspect-square ${
                            cell ? "bg-black" : "bg-white"
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-300 animate-pulse" />
                  )}

                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <Shield className="w-2 h-2 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/5 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
          </div>
        </div>

        <div className="absolute left-2/5 top-0 bottom-0 w-px">
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
  );
}
