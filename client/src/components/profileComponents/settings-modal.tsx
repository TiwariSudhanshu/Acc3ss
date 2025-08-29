"use client";
import { useState, useRef } from "react";
import type React from "react";
import { X, Camera, Upload } from "lucide-react";
import { useDispatch } from "react-redux";
import { useAccount } from "wagmi";
import { updateProfilePicture, updateUserDetails } from "@/store/userSlice";
import { toast } from "sonner";
import Image from "next/image";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    walletAddress: string;
    profilePicture: string;
  };
}

export default function SettingsModal({
  isOpen,
  onClose,
  user,
}: SettingsModalProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState("update-details");
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [profilePicture, setProfilePicture] = useState(user.profilePicture);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const { address } = useAccount();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/updateDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          walletAddress: address || user.walletAddress,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        dispatch(
          updateUserDetails({ name: formData.name, email: formData.email })
        );
        toast.success("Details updated successfully!");
        onClose();
      } else {
        toast.error(result.error || "Failed to update details");
      }
    } catch (error) {
      toast.error("An error occurred while updating details");
      console.error("Error updating details:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("walletAddress", address || user.walletAddress);

    try {
      const res = await fetch("/api/changeProfile", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result?.url) {
        setProfilePicture(result.url);
        dispatch(updateProfilePicture(result.url));
      } else {
        console.error("Upload failed", result.error);
      }
    } catch (error) {
      console.error("Error uploading:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePicture("");
    dispatch(updateProfilePicture(""));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveSettingsTab("update-details")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 relative ${
                activeSettingsTab === "update-details"
                  ? "text-white bg-gray-800/50"
                  : "text-gray-300 hover:text-white hover:bg-gray-800/30"
              }`}
            >
              Update Details
              {activeSettingsTab === "update-details" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-600" />
              )}
            </button>
            <button
              onClick={() => setActiveSettingsTab("update-avatar")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 relative ${
                activeSettingsTab === "update-avatar"
                  ? "text-white bg-gray-800/50"
                  : "text-gray-300 hover:text-white hover:bg-gray-800/30"
              }`}
            >
              Update Avatar
              {activeSettingsTab === "update-avatar" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-600" />
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-6 p-6">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <div className="hidden lg:block col-span-1 space-y-2">
            <button
              onClick={() => setActiveSettingsTab("update-details")}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 relative ${
                activeSettingsTab === "update-details"
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Update Details
              {activeSettingsTab === "update-details" && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setActiveSettingsTab("update-avatar")}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 relative ${
                activeSettingsTab === "update-avatar"
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Update Avatar
              {activeSettingsTab === "update-avatar" && (
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          {/* Content - Full width on mobile, 3/4 on desktop */}
          <div className="lg:col-span-3">
            {activeSettingsTab === "update-details" && (
              <div className="space-y-6">
                {/* Wallet Address Display */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Wallet Address
                  </label>
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <p className="text-sm text-gray-300 font-mono break-all">
                      {address || user.walletAddress}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Wallet address cannot be changed
                  </p>
                </div>

                {/* Update Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-300 mb-2 block"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Enter your name"
                      disabled={formLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-300 mb-2 block"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Enter your email"
                      disabled={formLoading}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={formLoading}
                      className="bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeSettingsTab === "update-avatar" && (
              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">
                    Profile Picture
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
                    <div className="relative self-center sm:self-auto">
                      <Image
                        src={profilePicture || "/placeholder.svg"}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover border-4 border-orange-500/30"
                      />

                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      {loading && (
                        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center text-white text-xs">
                          Uploading...
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row gap-3 mb-3">
                        <label className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer flex items-center justify-center">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New Photo
                          <input
                            type="file"
                            accept="image/*"
                            ref={inputRef}
                            onChange={handleProfilePictureChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Remove Photo
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Recommended: Square image, at least 400x400px. Max file
                        size: 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Avatar Preview */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">
                    Current Avatar
                  </h3>
                  <div className="flex items-center space-x-4">
                    <Image
                      src={profilePicture || "/placeholder.svg"}
                      alt="Current Avatar"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                    />

                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-gray-400 text-sm">
                        This is how your avatar appears to others
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
