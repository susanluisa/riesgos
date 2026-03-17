# Sistema de Gestión de Riesgos Ocupacionales - Simulación

Sistema integral para análisis predictivo y gestión de riesgos ocupacionales con IA, desarrollado con Next.js 15 y TypeScript.

## Características Principales

### Dashboard Inteligente
- Métricas en tiempo real de riesgos ocupacionales
- Indicadores de cumplimiento normativo
- Estadísticas de incidentes y recomendaciones
- Visualización de datos con gráficos interactivos

### Predicción de Riesgos con IA
- **Predicción en Tiempo Real**: Monitoreo continuo con sensores ambientales
- **Predicción Manual**: Formularios basados en matrices IPERC
- Cálculo de probabilidades de accidentes
- Generación automática de recomendaciones de seguridad

### Gestión de Equipos de Seguridad
- Configuración de responsables de seguridad
- Sistema de notificaciones multi-canal (Email, WhatsApp, SMS)
- Gestión de roles y permisos
- Historial de actividades

### Gestión de Escenarios de Riesgo
- Creación y edición de escenarios personalizados
- Clasificación por niveles de riesgo
- Seguimiento de medidas correctivas
- Análisis de tendencias

### Asistente IA Especializado
- Consultas sobre normativas de seguridad
- Recomendaciones personalizadas
- Análisis de riesgos específicos
- Base de conocimiento actualizada

### Gestión Documental
- Almacenamiento de documentos de seguridad
- Control de versiones
- Búsqueda avanzada
- Integración con sistemas externos

## Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Gráficos**: Recharts
- **Almacenamiento**: localStorage con sistema de backups
- **Notificaciones**: Sistema toast personalizado
- **Iconos**: Lucide React

## Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone [url-del-repositorio]
cd sistema-gestion-riesgos
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

4. **Construir para producción**
\`\`\`bash
npm run build
npm start
\`\`\`

## 🔧 Configuración

### Variables de Entorno
Crear un archivo `.env.local` con:

\`\`\`env
# Directorio de datos (opcional)
DATA_DIR=./data

# Configuración de notificaciones (opcional)
NEXT_PUBLIC_NOTIFICATION_API_URL=
\`\`\`

### Configuración de Almacenamiento
El sistema se configura automáticamente:
- **Desarrollo**: Almacenamiento en archivos locales
- **Producción**: localStorage del navegador

## Uso del Sistema

### 1. Dashboard Principal
- Accede a `/` para ver el dashboard principal
- Visualiza métricas clave y estadísticas
- Navega entre diferentes secciones

### 2. Configuración de Equipo
- Ve a `/settings` para configurar tu equipo de seguridad
- Agrega miembros con roles específicos
- Configura preferencias de notificación

### 3. Predicción de Riesgos
- Accede a `/prediction` para predicciones en tiempo real
- Usa la predicción manual para análisis específicos
- Envía alertas a responsables de seguridad

### 4. Gestión de Escenarios
- Ve a `/analysis` para gestionar escenarios de riesgo
- Crea, edita y elimina escenarios
- Consulta al asistente IA para recomendaciones

### 5. Reportes y Documentos
- Accede a `/reports` para ver recomendaciones
- Ve a `/documents` para gestión documental
- Exporta datos y reportes

## Seguridad y Privacidad

- Todos los datos se almacenan localmente
- Sistema de backups automáticos
- Encriptación de datos sensibles
- Logs de auditoría completos

## Funcionalidades Avanzadas

### Sistema de Notificaciones
- Notificaciones en tiempo real
- Múltiples canales de comunicación
- Escalamiento automático por nivel de riesgo
- Confirmación de recepción

### Análisis Predictivo
- Algoritmos de machine learning
- Análisis de patrones históricos
- Predicción de tendencias
- Alertas tempranas

### Integración de Datos
- Importación/exportación de datos
- API para sistemas externos
- Sincronización automática
- Formatos estándar (CSV, JSON, Excel)

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o consultas:
- Email: soporte@sistema-riesgos.com
- Documentación: [docs.sistema-riesgos.com]
- Issues: [GitHub Issues]


### Versión 1.0.0
- Sistema completo de gestión de riesgos
- Predicción con IA en tiempo real
- Gestión de equipos y notificaciones
- Dashboard interactivo
- Asistente IA especializado
- Sistema de almacenamiento robusto

---

**Desarrollado para mejorar la seguridad ocupacional**
