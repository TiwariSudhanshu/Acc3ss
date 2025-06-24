"use client";
import { X, CreditCard, Wallet, Shield } from "lucide-react";
import Ticket from "./ticket";
import { useState } from "react";
import { toast } from "sonner";
import { getContract } from "@/contract/contract";
import { BigNumberish, parseEther } from "ethers";

interface BuyTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: {
    id: number;
    title: string;
    banner: string;
    date: string;
    time: string;
    location: string;
    price: string;
    organizer: {
      name: string;
    };
  };
}

export default function BuyTicketModal({
  isOpen,
  onClose,
  eventData,
}: BuyTicketModalProps) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const contract = await getContract();

      let value: BigNumberish = 0;
      if (eventData.price !== "Free") {
        value = parseEther(eventData.price.toString());
      }

      const tx = await contract.mintTicket(eventData.id, { value });
      const receipt = await tx.wait();

      if (tx) {
        toast.success("Ticket purchased successfully!");
        console.log("Transaction successful:", receipt);
        onClose();
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      toast.error("Purchase failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800/95 border border-gray-700/50 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors duration-200 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Purchase Ticket
            </h2>
            <p className="text-gray-300">
              Review your ticket details before purchase
            </p>
          </div>

          {/* Ticket Preview */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-orange-400" />
              Your Ticket Preview
            </h3>
            <Ticket
              eventTitle={eventData.title}
              eventBanner={eventData.banner}
              eventDate={eventData.date}
              eventTime={eventData.time}
              location={eventData.location}
              organizerName={eventData.organizer.name}
              price={eventData.price}
            />
          </div>

          {/* Purchase Details */}
          <div className="bg-gray-700/30 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">
              Purchase Details
            </h3>

            <div className="grid gap-6">
              {/* Price Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Price Summary
                </label>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Ticket Price:</span>
                    <span>{eventData.price}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>Total:</span>
                      <span>{eventData.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-700/30 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-orange-400" />
              Payment Method
            </h3>
            <div className="flex items-center space-x-4 p-4 bg-gray-600/30 rounded-xl border border-gray-600/50">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">MetaMask Wallet</p>
                <p className="text-gray-400 text-sm">
                  Connect your wallet to purchase
                </p>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-600 text-white hover:bg-gray-700 py-4 rounded-xl font-bold text-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={loading}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                loading
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>{loading ? "Purchasing..." : "Purchase Ticket"}</span>
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-xl">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-300 font-medium text-sm">
                  Secure Transaction
                </p>
                <p className="text-blue-200/80 text-xs mt-1">
                  Your purchase is secured by blockchain technology. Ticket
                  ownership will be transferred to your wallet upon successful
                  payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
