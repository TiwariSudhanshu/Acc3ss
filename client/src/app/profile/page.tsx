import Header from "@/components/header"
import Footer from "@/components/footer"
import ProfileDashboard from "@/components/profile-dashboard"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-16">
        <ProfileDashboard />
      </div>
      <Footer/>
    </div>
  )
}
