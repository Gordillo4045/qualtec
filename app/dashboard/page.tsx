import { Layout } from "@/components/layout"

export default function DashboardPage() {
    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Panel principal con métricas y estadísticas del sistema
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Estudiantes</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">1,234</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inscripciones Activas</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">856</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Factores de Riesgo</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">42</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reportes Generados</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">28</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
