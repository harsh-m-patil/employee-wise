import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

export default function Home() {
  // Check if user is already logged in (client-side check will happen in layout)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) {
      redirect("/users")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">User Management System</h1>
          <p className="text-muted-foreground mt-2">Login to access the dashboard</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

