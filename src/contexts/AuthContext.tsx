import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authService } from '../services/auth.service'
import type { User } from '../types'

// Shape dari context yang bisa diakses komponen lain
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
  updateUser: (userData: User) => void
}

// Buat context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider — bungkus seluruh app dengan ini
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Saat app pertama kali dibuka, cek token yang ada di localStorage
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        // Validasi token dengan memanggil profile endpoint
        const response = await authService.getProfile()
        setUser(response.data)
      } catch {
        // Token invalid atau expired — bersihkan
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Dipanggil setelah login/register berhasil
  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  // Dipanggil saat user logout
  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Tetap lanjut logout meskipun API gagal (stateless JWT)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      window.location.href = '/'
    }
  }

  // Dipanggil setelah update profile berhasil
  const updateUser = (userData: User) => {
    setUser(userData)
  }

  const isAuthenticated = user !== null

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — pakai ini di komponen manapun
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
