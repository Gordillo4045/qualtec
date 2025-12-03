"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setMessage(error.message)
        } else {
            window.location.href = "/dashboard"
        }

        setLoading(false)
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: undefined, // Deshabilitar confirmación por correo
            }
        })

        if (error) {
            setMessage(error.message)
        } else if (data.user) {
            // Confirmar automáticamente el usuario
            try {
                const response = await fetch('/api/confirm-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                })

                if (response.ok) {
                    setMessage("Cuenta creada exitosamente. Ya puedes iniciar sesión.")
                } else {
                    setMessage("Cuenta creada, intenta iniciar sesión.")
                }
            } catch (confirmError) {
                console.error('Error confirming user:', confirmError)
                setMessage("Cuenta creada, intenta iniciar sesión.")
            }
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex h-full rounded-lg">
                <div className="flex-1 flex items-center justify-center">
                    <Card className="w-full h-full min-h-[450px] overflow-hidden py-0">
                        <CardContent className="grid p-0 md:grid-cols-2 h-full">
                            <form className="space-y-4 p-6 md:p-8 h-full flex flex-col justify-center">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
                                    <p className="text-balance text-muted-foreground">Inicia sesión en tu cuenta de QualTec</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                {message && (
                                    <div className="text-sm text-destructive text-center">
                                        {message}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        onClick={handleLogin}
                                        disabled={loading}
                                    >
                                        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleSignUp}
                                        disabled={loading}
                                    >
                                        {loading ? "Registrando..." : "Crear cuenta"}
                                    </Button>
                                </div>
                            </form>
                            <div className="flex-1 bg-primary/5 flex items-center justify-center p-8 h-full">
                                <div className="text-center space-y-6">
                                    <div className="flex justify-center">
                                        <Image
                                            src="/logo.png"
                                            alt="QualTec Logo"
                                            width={300}
                                            height={300}
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>


            </div>
        </div>
    )
}
