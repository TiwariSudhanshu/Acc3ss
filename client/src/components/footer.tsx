"use client"

import { Github, Twitter, DiscIcon as Discord } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-16 bg-black border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="col-span-2">
            <div className="text-3xl font-bold text-white mb-4">Acc3ss</div>
            <p className="text-gray-300 mb-6 max-w-md">
              The future of event ticketing is here. Create secure, verifiable, and collectible NFT tickets for your
              events.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-not-allowed opacity-50">
                <Twitter className="w-5 h-5 text-gray-400" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-not-allowed opacity-50">
                <Discord className="w-5 h-5 text-gray-400" />
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-not-allowed opacity-50">
                <Github className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="mailto:easydevs1@gmail.com" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 Acc3ss. All rights reserved.</p>
      
        </div>
      </div>
    </footer>
  )
}
