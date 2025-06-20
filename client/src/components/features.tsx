import { Smartphone, Globe, TrendingUp, Lock, RefreshCw, Star } from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Optimized for mobile devices with intuitive wallet integration and QR code scanning.",
    },
    {
      icon: Globe,
      title: "Multi-Chain Support",
      description: "Deploy events on multiple blockchains including Ethereum, Polygon, and more.",
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track ticket sales, attendance, and engagement with comprehensive analytics.",
    },
    {
      icon: Lock,
      title: "Anti-Fraud Protection",
      description: "Blockchain verification eliminates counterfeit tickets and unauthorized access.",
    },
    {
      icon: RefreshCw,
      title: "Resale Marketplace",
      description: "Built-in secondary market for ticket trading with royalties for organizers.",
    },
    {
      icon: Star,
      title: "Collectible Memories",
      description: "Tickets become permanent digital collectibles and proof of attendance.",
    },
  ]

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-300">Everything you need to create, manage, and attend Web3 events</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-gradient-to-b from-gray-800/30 to-gray-900/30 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 group"
            >
              <div className="w-14 h-14 mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
