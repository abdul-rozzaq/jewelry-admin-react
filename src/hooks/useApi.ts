"use client"

import { useEffect } from "react"
import { useRouter } from "@/src/i18n/routing"
import { toast } from "@/src/hooks/use-toast"

// Custom hook for handling API errors
export function useApiError() {
  const router = useRouter()

  const handleError = (error: any) => {
    if (error?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem("authToken")
      router.push("/login")
      toast({
        title: "Avtorizatsiya xatosi",
        description: "Iltimos, qaytadan tizimga kiring",
        variant: "destructive",
      })
    } else if (error?.status === 403) {
      // Forbidden
      toast({
        title: "Ruxsat yo'q",
        description: "Bu amalni bajarish uchun ruxsatingiz yo'q",
        variant: "destructive",
      })
    } else if (error?.status >= 500) {
      // Server error
      toast({
        title: "Server xatosi",
        description: "Iltimos, keyinroq qayta urinib ko'ring",
        variant: "destructive",
      })
    } else if (error?.data?.message) {
      // API error with message
      toast({
        title: "Xatolik",
        description: error.data.message,
        variant: "destructive",
      })
    } else {
      // Generic error
      toast({
        title: "Xatolik yuz berdi",
        description: "Iltimos, qayta urinib ko'ring",
        variant: "destructive",
      })
    }
  }

  return { handleError }
}

// Custom hook for handling API success
export function useApiSuccess() {
  const handleSuccess = (message: string) => {
    toast({
      title: "Muvaffaqiyat",
      description: message,
    })
  }

  return { handleSuccess }
}

// Custom hook for loading states
export function useLoadingState(isLoading: boolean, message = "Yuklanmoqda...") {
  useEffect(() => {
    if (isLoading) {
      // You can add a global loading indicator here if needed
      console.log(message)
    }
  }, [isLoading, message])

  return isLoading
}
