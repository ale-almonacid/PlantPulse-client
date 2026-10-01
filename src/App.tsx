//React
import { Routes, Route,} from "react-router-dom"

//Components
import Navbar from "@/components/navigation/Navbar"

//Pages 
import DashboardPage from "@/pages/DashboardPage"
import WateringsPage from "@/pages/WateringsPage"
import CalendarPage from "@/pages/CalendarPage"
import PlantsListPage from "@/pages/PlantsListPage"
import PlantDetailsPage from "@/pages/PlantDetailsPage"
import NotFoundPage from "@/pages/NotFoundPage"

export function App() {
  return (
    <>
     <Navbar />

     <Routes>

       <Route path="/" element={<DashboardPage />} />
       <Route path="/waterings" element={<WateringsPage />} />
       <Route path="/calendar" element={<CalendarPage />} />
       <Route path="/plants" element={<PlantsListPage />} />
       <Route path="/plants/:plantId" element={<PlantDetailsPage />} />
      

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />


    </Routes>
    </>
  )
}

export default App
