import { Layout } from "@/components/layout"

export default function AnaliticaPage() {
    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analítica</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Análisis estadístico y visualización de datos académicos
                    </p>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Análisis de Calidad</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Aquí se mostrarán gráficos de Pareto, histogramas, dispersión y otros análisis estadísticos.
                    </p>
                </div>
            </div>
        </Layout>
    )
}
