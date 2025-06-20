import Header from "@/components/header"
import EventDetails from "@/components/event-details"
import Footer from "@/components/footer"

export default function EventDetailPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-16">
        <EventDetails />
      </div>
      <Footer/>
    </div>
  )
}
