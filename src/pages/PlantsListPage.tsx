import CreatePlantDialog from "@/components/plants/CreatePlantDialog"

function PlantsListPage() {
  return (
    <div className="mx-auto w-full max-w-360 px-[8vw] py-8">
      <header className="flex items-center justify-between">
        <h1 className="heading-h">My plants</h1>
        <CreatePlantDialog />
      </header>
    </div>
  )
}

export default PlantsListPage
