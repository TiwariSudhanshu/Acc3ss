import { Calendar, Coins, Scan, CheckCircle } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: Calendar,
      title: "Create Event",
      description: "Event organizers create their event and set ticket parameters on our platform.",
    },
    {
      icon: Coins,
      title: "Mint NFT Tickets",
      description: "Attendees purchase tickets which are minted as unique NFTs to their wallet.",
    },
    {
      icon: Scan,
      title: "Scan at Gate",
      description: "Our scanner verifies wallet ownership of valid NFTs for instant event access.",
    },
    {
      icon: CheckCircle,
      title: "Enjoy Event",
      description: "Attendees enjoy the event while owning a permanent digital collectible.",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-gray-300">
            Simple, secure, and seamless event ticketing powered by blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center p-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center relative">
                  <step.icon className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-red-600 transform -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
