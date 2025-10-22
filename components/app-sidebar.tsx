"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    BookOpen,
    BarChart3,
    FileText,
    Settings,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Estudiantes",
            url: "/estudiantes",
            icon: Users,
        },
        {
            title: "Inscripciones",
            url: "/inscripciones",
            icon: BookOpen,
        },
        {
            title: "Factores",
            url: "/factores",
            icon: BarChart3,
        },
        {
            title: "Analítica",
            url: "/analitica",
            icon: BarChart3,
        },
        {
            title: "Reportes",
            url: "/reportes",
            icon: FileText,
        },
        {
            title: "Configuración",
            url: "/configuracion",
            icon: Settings,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon" {...props} variant="inset">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
                        <div className="size-4 font-bold">QT</div>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                        <span className="truncate font-semibold">QualTec</span>
                        <span className="truncate text-xs">Sistema de Calidad</span>
                    </div>
                    <div className="shrink-0">
                        <ThemeToggle />
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navegación</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.navMain.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>
            <SidebarFooter>
                <div className="text-xs text-muted-foreground text-center p-2 truncate">
                    <span className="hidden group-data-[collapsible=icon]:block">QualTec</span>
                    <span className="group-data-[collapsible=icon]:hidden">
                        Sistema de Gestión de Calidad Académica
                    </span>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
