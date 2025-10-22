"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    BookOpen,
    BarChart3,
    FileText,
    Settings,
    LogOut,
    User,
    ChevronDown,
    GraduationCap,
    Building,
    Calendar,
    BookMarked,
    Users2,
    ClipboardList
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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "./theme-toggle"
import { User2, ChevronUp, Moon, Sun } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "next-themes"

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
    ],
    navConfig: [
        {
            title: "Académica",
            icon: Settings,
            items: [
                {
                    title: "Carreras",
                    url: "/configuracion/carreras",
                    icon: GraduationCap,
                },
                {
                    title: "Materias",
                    url: "/configuracion/materias",
                    icon: BookMarked,
                },
                {
                    title: "Grupos",
                    url: "/configuracion/grupos",
                    icon: Users2,
                },
                {
                    title: "Periodos",
                    url: "/configuracion/periodos",
                    icon: Calendar,
                },
                {
                    title: "Ofertas",
                    url: "/configuracion/ofertas",
                    icon: ClipboardList,
                },
                {
                    title: "Departamentos",
                    url: "/configuracion/departamentos",
                    icon: Building,
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { user, signOut } = useAuth()
    const { theme, setTheme } = useTheme()

    return (
        <Sidebar collapsible="icon" {...props} variant="inset">
            <SidebarHeader>
                <div className="flex items-center justify-center gap-2">
                    <div className="flex aspect-square size-8 items-center justify-center shrink-0 group-data-[collapsible=icon]:justify-center">
                        <Image
                            src="/logo.png"
                            alt="QualTec Logo"
                            width={32}
                            height={32}
                            className="rounded object-contain"
                        />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">QualTec</span>
                        <span className="truncate text-xs">Sistema de Calidad</span>
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

                <SidebarGroup>
                    <SidebarGroupLabel>Configuración</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.navConfig.map((section) => (
                                <Collapsible key={section.title} defaultOpen className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={section.title}
                                                className="group-data-[collapsible=icon]:hidden"
                                            >
                                                <section.icon />
                                                <span>{section.title}</span>
                                                <ChevronDown className="ml-auto" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {section.items.map((item) => (
                                                    <SidebarMenuSubItem key={item.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={pathname === item.url}
                                                        >
                                                            <Link href={item.url}>
                                                                <item.icon />
                                                                <span>{item.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 />
                                    <span className="group-data-[collapsible=icon]:hidden">
                                        {user?.user_metadata?.full_name || user?.email || 'Usuario'}
                                    </span>
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-(--radix-popper-anchor-width) min-w-[200px]"
                            >
                                <DropdownMenuItem>
                                    <User className="mr-2" />
                                    <span>Perfil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <button
                                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                        className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                                        <span>Cambiar tema</span>
                                    </button>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={signOut}>
                                    <LogOut className="mr-2" />
                                    <span>Cerrar sesión</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
