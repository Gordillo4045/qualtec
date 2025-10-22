import { Layout } from "@/components/layout"

export default function Page() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Bienvenido a QualTec</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de Gestión y Análisis de Calidad Académica
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Dashboard</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Panel principal con métricas y estadísticas
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Estudiantes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestión completa de información estudiantil
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Analítica</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Análisis de factores de riesgo y calidad
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
