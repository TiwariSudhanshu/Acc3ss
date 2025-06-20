import Header from "@/components/header"
import ExploreEvents from "@/components/explore-events"
import Footer from "@/components/footer"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-16">
        <ExploreEvents />
      </div>
      <Footer/>
    </div>
  )
}
