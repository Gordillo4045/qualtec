import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    GraduationCap,
    BookMarked,
    Users2,
    Calendar,
    ClipboardList,
    Building,
    ArrowRight,
    Plus,
    Settings
} from "lucide-react"
import Link from "next/link"

export default function ConfiguracionPage() {
    const configSections = [
        {
            title: "Carreras",
            description: "Gestiona los programas académicos y sus configuraciones",
            icon: GraduationCap,
            url: "/configuracion/carreras",
            count: 8,
            color: "bg-blue-500"
        },
        {
            title: "Materias",
            description: "Administra las materias y sus contenidos curriculares",
            icon: BookMarked,
            url: "/configuracion/materias",
            count: 45,
            color: "bg-green-500"
        },
        {
            title: "Grupos",
            description: "Configura los grupos de estudiantes y sus horarios",
            icon: Users2,
            url: "/configuracion/grupos",
            count: 12,
            color: "bg-purple-500"
        },
        {
            title: "Periodos",
            description: "Gestiona los periodos académicos y fechas importantes",
            icon: Calendar,
            url: "/configuracion/periodos",
            count: 3,
            color: "bg-orange-500"
        },
        {
            title: "Ofertas",
            description: "Administra las ofertas académicas por periodo",
            icon: ClipboardList,
            url: "/configuracion/ofertas",
            count: 156,
            color: "bg-red-500"
        },
        {
            title: "Departamentos",
            description: "Configura los departamentos académicos",
            icon: Building,
            url: "/configuracion/departamentos",
            count: 6,
            color: "bg-indigo-500"
        }
    ]

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Configuración Académica</h1>
                        <p className="text-muted-foreground">
                            Gestiona todos los aspectos de la configuración académica del sistema
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configuración General
                        </Button>
                    </div>
                </div>

                {/* Secciones de configuración */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {configSections.map((section) => (
                        <Card key={section.title} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2 rounded-lg ${section.color} text-white`}>
                                        <section.icon className="h-6 w-6" />
                                    </div>
                                    <Badge variant="outline">{section.count}</Badge>
                                </div>
                                <CardTitle className="text-lg">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {section.description}
                                </p>
                                <Link href={section.url}>
                                    <Button size="sm" className="w-full">
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        Gestionar
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Resumen general */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Carreras</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8</div>
                            <p className="text-xs text-muted-foreground">
                                Programas académicos activos
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Materias</CardTitle>
                            <BookMarked className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">45</div>
                            <p className="text-xs text-muted-foreground">
                                Materias registradas
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
                            <Users2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">
                                Grupos en el periodo actual
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ofertas Activas</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">156</div>
                            <p className="text-xs text-muted-foreground">
                                Ofertas académicas disponibles
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}