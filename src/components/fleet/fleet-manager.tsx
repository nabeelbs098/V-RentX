"use client"

import * as React from "react"
import { PlusCircle, Search } from "lucide-react"
import { getColumns } from "./columns"
import { DataTable } from "./data-table"
import { Vehicle, vehicleTypes, vehicleAvailabilities } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { VehicleForm } from "./vehicle-form"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore"

export function FleetManager() {
  const [vehicles, setVehicles] = React.useState<Vehicle[]>([])
  const [search, setSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [availabilityFilter, setAvailabilityFilter] = React.useState<string>("all")

  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingVehicle, setEditingVehicle] = React.useState<Vehicle | null>(null)
  
  const [isAlertOpen, setIsAlertOpen] = React.useState(false)
  const [deletingVehicleId, setDeletingVehicleId] = React.useState<string | null>(null)

  const { toast } = useToast()

  React.useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "vehicles"), (snapshot) => {
      const vehiclesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Vehicle[];
      setVehicles(vehiclesData);
    });
    return () => unsubscribe();
  }, []);

  const handleAddNew = () => {
    setEditingVehicle(null)
    setIsFormOpen(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setIsFormOpen(true)
  }
  
  const handleDeleteRequest = (vehicleId: string) => {
    setDeletingVehicleId(vehicleId)
    setIsAlertOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deletingVehicleId) {
      try {
        await deleteDoc(doc(db, "vehicles", deletingVehicleId));
        toast({
          title: "Vehicle Removed",
          description: "The vehicle has been successfully removed from the fleet.",
        })
      } catch (error) {
        toast({
          title: "Error removing vehicle",
          description: "There was a problem removing the vehicle. Please try again.",
          variant: "destructive"
        })
      }
    }
    setIsAlertOpen(false)
    setDeletingVehicleId(null)
  }

  const handleFormSubmit = async (data: Omit<Vehicle, 'id'>) => {
    try {
      if (editingVehicle && editingVehicle.id) {
        // Update
        const vehicleRef = doc(db, "vehicles", editingVehicle.id);
        await updateDoc(vehicleRef, data);
        toast({
          title: "Vehicle Updated",
          description: "The vehicle details have been successfully updated.",
        })
      } else {
        // Add
        await addDoc(collection(db, "vehicles"), data);
        toast({
          title: "Vehicle Added",
          description: "A new vehicle has been successfully added to the fleet.",
        })
      }
      setIsFormOpen(false)
      setEditingVehicle(null)
    } catch (error) {
       toast({
        title: "Error submitting form",
        description: "There was a problem saving the vehicle. Please try again.",
        variant: "destructive"
      })
    }
  }

  const columns = React.useMemo(() => getColumns({ onEdit: handleEdit, onDelete: handleDeleteRequest }), []);

  const filteredVehicles = React.useMemo(() => {
    return vehicles
      .filter((vehicle) =>
        vehicle.name.toLowerCase().includes(search.toLowerCase())
      )
      .filter((vehicle) =>
        typeFilter === "all" ? true : vehicle.type === typeFilter
      )
      .filter((vehicle) =>
        availabilityFilter === "all"
          ? true
          : vehicle.availability === availabilityFilter
      )
  }, [vehicles, search, typeFilter, availabilityFilter])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Fleetly Admin</CardTitle>
          <CardDescription>
            Manage your vehicle fleet with ease. Search, filter, and manage your assets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-10"
              />
            </div>
            <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {vehicleTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availabilities</SelectItem>
                  {vehicleAvailabilities.map(av => <SelectItem key={av} value={av}>{av}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleAddNew} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </div>
          </div>
          <DataTable columns={columns} data={filteredVehicles} />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
            <DialogDescription>
              {editingVehicle ? 'Update the details of the existing vehicle.' : 'Enter the details for the new vehicle.'}
            </DialogDescription>
          </DialogHeader>
          <VehicleForm
            onSubmit={handleFormSubmit}
            vehicle={editingVehicle}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the vehicle
              from your fleet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
