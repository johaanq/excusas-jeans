"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { Lock, User, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const success = await login(username, password)
            if (success) {
                router.push('/admin')
            } else {
                setError('Credenciales incorrectas')
            }
        } catch {
            setError('Error al iniciar sesión')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 shadow-xl">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo-excusas.png"
                            alt="Logo Excusas"
                            width={60}
                            height={60}
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Panel de Administración
                    </h1>
                    <p className="text-gray-600">
                        Inicia sesión para acceder al panel
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="text-sm font-medium">
                            Usuario
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
                 
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pl-10"
                                placeholder="Ingresa tu usuario"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                            Contraseña
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10"
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                                tabIndex={-1}
                            >
                                {showPassword
                                    ? <EyeOff className="w-5 h-5" />
                                    : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            ¿Necesitas ayuda? Contacta al administrador del sistema.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    )
}
