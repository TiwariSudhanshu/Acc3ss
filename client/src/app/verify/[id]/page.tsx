"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  QrCode,
  Users,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MapPin,
  Ticket,
  Filter,
  Download,
  UserCheck,
  UserX,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getContract } from "@/contract/contract";
import { useAccount } from "wagmi";
import Image from "next/image";

interface TicketEntry {
  ticketId: string;
  email: string;
  name: string;
  profilePicture: string;
  walletAddress: string;
  status: "checked-in" | "pending";
  checkInTime?: string;
}

interface Attendee {
  email: string;
  name: string;
  profilePicture: string;
  ticketsOwned: string[];
  walletAddress: string;
  eventsAttended: string[];
}

interface EventDetails {
  id: number;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  totalSupply: number;
  sold: number;
  category: string;
  status: string;
}

export default function VerifyEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { address } = useAccount();
  // State management
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [ticketEntries, setTicketEntries] = useState<TicketEntry[]>([]);
  const [filteredTicketEntries, setFilteredTicketEntries] = useState<
    TicketEntry[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "checked-in" | "pending"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketEntry | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    checkedIn: 0,
    pending: 0,
  });

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerInitialized = useRef(false);

  // QR Scanner initialization
  useEffect(() => {
    if (!isScannerOpen) {
      if (scannerRef.current && isScannerInitialized.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            isScannerInitialized.current = false;
          })
          .catch((err) => console.error("Failed to stop scanner:", err));
      }
      return;
    }

    if (isScannerInitialized.current) return;

    const initializeScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          // Try to pick rear camera (back facing) first
          let cameraId = devices[0].id;
          const backCamera = devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("rear") ||
              d.label.toLowerCase().includes("environment")
          );

          if (backCamera) {
            cameraId = backCamera.id;
          }

          await html5QrCode.start(
            cameraId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText: string) => {
              handleQRScan(decodedText);
            },
            () => {}
          );

          isScannerInitialized.current = true;
        }
      } catch (err) {
        console.error("Camera initialization error:", err);
        toast.error("Failed to initialize camera");
        setIsScannerOpen(false);
      }
    };

    initializeScanner();

    return () => {
      if (scannerRef.current && isScannerInitialized.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            isScannerInitialized.current = false;
          })
          .catch((err) => console.error("Cleanup error:", err));
      }
    };
  }, [isScannerOpen]);

  const closeScannerSafely = () => {
    if (scannerRef.current && isScannerInitialized.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear();
          isScannerInitialized.current = false;
          setIsScannerOpen(false);
        })
        .catch((err) => {
          console.error("Failed to close scanner:", err);
          setIsScannerOpen(false);
        });
    } else {
      setIsScannerOpen(false);
    }
  };

  const getEvent = async () => {
    try {
      const res = await fetch("/api/getAllEvents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventId,
        }),
      });
      const data = await res.json();
      console.log("Fetched event data:", data);
      if (res.ok) {
        setEventDetails(data);
        return true;
      } else {
        console.error("Error fetching event:", data.error);
        toast.error("Failed to fetch event");
      }
    } catch (error) {
      console.error("Error in getEvent:", error);
      toast.error("Failed to fetch event");
    }
  };

  const handleGetAttendees = async () => {
    try {
      const contract = await getContract();
      const lastTicketId = await contract.nextTokenId();
      const matchedTickets = [];

      for (let i = 0; i < lastTicketId; i++) {
        const thisEvent = await contract.tokenToEvent(i);
        if (thisEvent.toString() === eventId.toString()) {
          matchedTickets.push(i);
        }
      }

      const res = await fetch("/api/getAttendees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketIds: matchedTickets,
          eventId: eventId,
        }),
      });

      const data = await res.json();
      console.log("Attendees data:", data);

      if (res.ok) {
        const ticketEntriesData: TicketEntry[] = [];
        let checkedInCount = 0;
        let pendingCount = 0;
        data.attendees.forEach((attendee: Attendee) => {
          const hasAttended = attendee.eventsAttended.includes(eventId);
          const status: "checked-in" | "pending" = hasAttended
            ? "checked-in"
            : "pending";

          if (hasAttended) {
            checkedInCount++;
          } else {
            pendingCount++;
          }

          // Push only once per attendee
          ticketEntriesData.push({
            ticketId: attendee.ticketsOwned[0],
            email: attendee.email,
            name: attendee.name,
            profilePicture: attendee.profilePicture,
            walletAddress: attendee.walletAddress,
            status: status,
            checkInTime: hasAttended ? new Date().toLocaleString() : undefined,
          });
        });

        setTicketEntries(ticketEntriesData);
        setFilteredTicketEntries(ticketEntriesData);
        setStats({
          total: ticketEntriesData.length,
          checkedIn: checkedInCount,
          pending: pendingCount,
        });
      } else {
        console.error("Error fetching attendees:", data.error);
        toast.error("Failed to fetch attendees");
      }
    } catch (error) {
      console.error("Error in handleGetAttendees:", error);
      toast.error("Failed to fetch attendees");
    }
  };

  const applyFilters = (ticketList: TicketEntry[]) => {
    let filtered = ticketList;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.walletAddress
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === filterStatus);
    }

    return filtered;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = applyFilters(ticketEntries);
    setFilteredTicketEntries(filtered);
  };

  const handleStatusFilter = (status: "all" | "checked-in" | "pending") => {
    setFilterStatus(status);
    const filtered = applyFilters(ticketEntries);
    setFilteredTicketEntries(filtered);
  };

  const decryptQR = async (encrypted: string) => {
    try {
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
        ["decrypt"]
      );

      const combinedBytes = Uint8Array.from(atob(encrypted), (c) =>
        c.charCodeAt(0)
      );
      const iv = combinedBytes.slice(0, 12);
      const encryptedData = combinedBytes.slice(12);

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        cryptoKey,
        encryptedData
      );

      const decodedText = new TextDecoder().decode(decryptedBuffer);
      const [walletAddress, ticketId] = decodedText.split("-");

      if (!walletAddress || !ticketId) {
        throw new Error("Invalid QR code format.");
      }

      return { walletAddress, ticketId };
    } catch (error) {
      console.error("Error verifying QR code:", error);
      throw new Error("Invalid QR code format!");
    }
  };

  const verifyTicketData = async (walletAddress: string, ticketId: string) => {
    try {
      const contract = await getContract();
      const ticket = ticketEntries.find(
        (t) => t.walletAddress === walletAddress || t.ticketId === ticketId
      );
      const eventIdOfTicket = await contract.tokenToEvent(ticketId);
      const isMatch = eventIdOfTicket.toString() === eventId.toString();

      if (!isMatch) {
        throw new Error("Ticket does not belong to this event!");
      }

      if (ticket) {
        const owner = await contract.ownerOf(ticket.ticketId);
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
          return ticket;
        } else {
          throw new Error("Ticket ownership verification failed!");
        }
      } else {
        throw new Error("Invalid ticket or ticket not found!");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleQRScan = async (data: string) => {
    setIsVerificationLoading(true);
    closeScannerSafely();

    try {
      // Show verification modal with loading state
      setIsVerificationModalOpen(true);
      const result = await decryptQR(data);
      if (!result) {
        throw new Error("Invalid QR code format!");
      }

      const { walletAddress, ticketId } = result;
      const ticket = await verifyTicketData(walletAddress, ticketId);
      setSelectedTicket(ticket);
    } catch (error) {
      console.error("Error in handleQRScan:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process QR code"
      );
      setIsVerificationModalOpen(false);
    } finally {
      setIsVerificationLoading(false);
    }
  };

  const handleVerifyClick = (ticket: TicketEntry) => {
    setSelectedTicket(ticket);
    setIsVerificationModalOpen(true);
    setAccessGranted(false);
  };

  const handleGrantAccess = async () => {
    if (!selectedTicket) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/grantAccess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: selectedTicket.ticketId,
          walletAddress: selectedTicket.walletAddress,
          eventId: eventId,
        }),
      });

      if (res.ok) {
        setAccessGranted(true);
        toast.success("Access granted successfully!");

        // Update ticket status in local state
        const updatedTickets = ticketEntries.map((ticket) =>
          ticket.ticketId === selectedTicket.ticketId
            ? {
                ...ticket,
                status: "checked-in" as const,
                checkInTime: new Date().toLocaleString(),
              }
            : ticket
        );
        setTicketEntries(updatedTickets);
        setFilteredTicketEntries(applyFilters(updatedTickets));

        // Update stats
        setStats((prev) => ({
          ...prev,
          checkedIn: prev.checkedIn + 1,
          pending: prev.pending - 1,
        }));

        // Close modal after 2 seconds
        setTimeout(() => {
          setIsVerificationModalOpen(false);
          setSelectedTicket(null);
          setAccessGranted(false);
        }, 2000);
      } else {
        toast.error("Failed to grant access");
      }
    } catch (error) {
      console.error("Error granting access:", error);
      toast.error("Failed to grant access");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAccess = () => {
    toast.info("Access rejected");
    setIsVerificationModalOpen(false);
    setSelectedTicket(null);
    setAccessGranted(false);
  };

  const exportAttendees = async () => {
    setIsExporting(true);
    try {
      // Create Excel-compatible CSV with BOM for proper encoding
      const BOM = "\uFEFF";
      const csvContent =
        BOM +
        [
          [
            "Name",
            "Email",
            "Wallet Address",
            "Ticket ID",
            "Status",
            "Check-in Time",
          ].join(","),
          ...filteredTicketEntries.map((ticket) =>
            [
              `"${ticket.name}"`,
              `"${ticket.email}"`,
              `"${ticket.walletAddress}"`,
              `"${ticket.ticketId}"`,
              `"${ticket.status === "checked-in" ? "Checked In" : "Pending"}"`,
              `"${ticket.checkInTime || "Not checked in"}"`,
            ].join(",")
          ),
        ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = eventDetails?.title
        ? eventDetails.title.replace(/\s+/g, "-").toLowerCase()
        : "event";

      link.download = `${fileName}-attendees.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export attendee list");
    } finally {
      setIsExporting(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (!eventId) return;

    const loadData = async () => {
      setIsLoading(true);
      const eventFound = await getEvent(); // Added await to properly wait for getEvent to complete
      if (!eventFound) {
        toast.error("Event not found ");
        setIsLoading(false);
        return;
      }
      await handleGetAttendees();
      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Event Not Found
          </h1>
          <p className="text-gray-400 mb-4 text-sm sm:text-base">
            The event you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (eventDetails.organizer?.toLowerCase() !== address?.toLowerCase()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Access Denied
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Verify</h1>
              <p className="text-gray-300 text-sm truncate max-w-[120px] sm:max-w-[200px]">
                {eventDetails.title}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportAttendees}
              disabled={isExporting}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors flex items-center justify-center"
            >
              {isExporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-3 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Verify Attendees
              </h1>
              <p className="text-gray-300">{eventDetails.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportAttendees}
              disabled={isExporting}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isExporting ? "Exporting..." : "Export"}
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Scan QR Code
            </button>
          </div>
        </div>

        {/* Event Info Card */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Image
              src={
                eventDetails.image || "/placeholder.svg?height=128&width=128"
              }
              alt={eventDetails.title}
              width={128}
              height={128}
              className="w-full sm:w-32 h-32 rounded-xl object-cover"
            />

            <div className="flex-1 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {eventDetails.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                  <span className="truncate">
                    {eventDetails.date} at {eventDetails.time}
                  </span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                  <span className="truncate">{eventDetails.location}</span>
                </div>
                <div className="flex items-center text-gray-300 sm:col-span-2 lg:col-span-1">
                  <User className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                  <span className="truncate">{eventDetails.organizer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {stats.total}
                </p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Checked In</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-400">
                  {stats.checkedIn}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-400">
                  {stats.pending}
                </p>
              </div>
              <Ticket className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, wallet..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">Filters:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) =>
                  handleStatusFilter(
                    e.target.value as "all" | "checked-in" | "pending"
                  )
                }
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 flex-shrink-0"
              >
                <option value="all">All Status</option>
                <option value="checked-in">Checked In</option>
                <option value="pending">Pending</option>
              </select>
              {(searchQuery || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                    setFilteredTicketEntries(ticketEntries);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Attendees List */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center">
              <Ticket className="w-5 h-5 mr-2 text-orange-400" />
              Tickets ({filteredTicketEntries.length} of {ticketEntries.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-700">
            {filteredTicketEntries.length === 0 ? (
              <div className="p-8 text-center">
                <Ticket className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  No tickets found matching your criteria
                </p>
              </div>
            ) : (
              filteredTicketEntries.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  className="p-4 sm:p-6 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                    {/* User Info */}
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                      <Image
                        src={
                          ticket.profilePicture ||
                          "/placeholder.svg?height=56&width=56"
                        }
                        alt={ticket.name}
                        width={56}
                        height={56}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-600 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                          <h4 className="font-semibold text-white text-base sm:text-lg truncate">
                            {ticket.name}
                          </h4>
                          <span className="px-2 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30 inline-block w-fit mt-1 sm:mt-0">
                            #{ticket.ticketId}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-300 flex items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 flex-shrink-0"></span>
                            <span className="truncate">{ticket.email}</span>
                          </p>
                          <p className="text-xs text-gray-400 flex items-center">
                            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 flex-shrink-0"></span>
                            <span className="truncate">
                              {ticket.walletAddress.slice(0, 8)}...
                              {ticket.walletAddress.slice(-6)}
                            </span>
                          </p>
                          {ticket.checkInTime && (
                            <p className="text-xs text-green-400 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                Checked in at {ticket.checkInTime}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 sm:flex-shrink-0">
                      {ticket.status === "checked-in" ? (
                        <div className="text-left sm:text-right">
                          <div className="flex items-center text-green-400 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Checked In</span>
                          </div>
                          {ticket.checkInTime && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {ticket.checkInTime}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <div className="text-left sm:text-right">
                            <div className="flex items-center text-orange-400 text-sm font-medium">
                              <XCircle className="w-4 h-4 mr-1" />
                              <span>Pending</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleVerifyClick(ticket)}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg"
                          >
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Scan QR Code
              </h2>
              <button
                onClick={closeScannerSafely}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="bg-gray-800 rounded-lg p-4 sm:p-8 text-center">
                <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  QR Scanner
                </h3>
                <p className="text-gray-400 mb-4 text-sm sm:text-base">
                  Position the QR code within the frame to scan
                </p>
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div
                    id="qr-reader"
                    className="aspect-square bg-gray-600 rounded-lg min-h-[250px]"
                  />
                </div>
                <button
                  onClick={closeScannerSafely}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {isVerificationLoading ? "Verifying..." : "Verify Attendee"}
              </h2>
              <button
                onClick={() => {
                  setIsVerificationModalOpen(false);
                  setSelectedTicket(null);
                  setAccessGranted(false);
                }}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {isVerificationLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 text-orange-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-400">Verifying QR code...</p>
                </div>
              ) : selectedTicket ? (
                <div className="text-center mb-6">
                  <Image
                    src={
                      selectedTicket.profilePicture ||
                      "/placeholder.svg?height=80&width=80"
                    }
                    alt={selectedTicket.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-600 mx-auto mb-4"
                  />

                  <h3 className="text-xl font-semibold text-white mb-2 break-words">
                    {selectedTicket.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-1 break-words">
                    {selectedTicket.email}
                  </p>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30">
                      Ticket #{selectedTicket.ticketId}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 break-all px-4">
                    Wallet: {selectedTicket.walletAddress.slice(0, 12)}...
                    {selectedTicket.walletAddress.slice(-8)}
                  </p>

                  {selectedTicket.status === "checked-in" ? (
                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center justify-center text-green-400 mb-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Checked In</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        This user has been checked in.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                      <button
                        onClick={handleRejectAccess}
                        disabled={isProcessing || accessGranted}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                      <button
                        onClick={handleGrantAccess}
                        disabled={isProcessing || accessGranted}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        {accessGranted ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2 text-green-300" />
                            Access Granted!
                          </>
                        ) : isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-5 h-5 mr-2" />
                            Grant Access
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
