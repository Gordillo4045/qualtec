import { Layout } from "@/components/layout"

export default function ConfiguracionPage() {
    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Configuración</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Configuración del sistema y parámetros generales
                    </p>
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Configuración del Sistema</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Aquí se podrán configurar departamentos, carreras, modalidades, periodos y otros parámetros del sistema.
                    </p>
                </div>
            </div>
        </Layout>
    )
}
