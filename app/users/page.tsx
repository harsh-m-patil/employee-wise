"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import UsersList from "@/components/users-list"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function UsersPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  if (!isClient) {
    return null // Prevent hydration errors
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Users Management</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        <UsersList />
      </div>
    </main>
  )
}

