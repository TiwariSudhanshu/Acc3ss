import Header from "@/components/header"
import CreateEventForm from "@/components/create-event-form"
import Footer from "@/components/footer"

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-16">
        <CreateEventForm />
      </div>
      <Footer/>
    </div>
  )
}
