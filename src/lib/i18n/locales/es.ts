import type { TranslationTree } from "./en";

export const es: { common: TranslationTree } = {
  common: {
    meta: {
      productName: "Countergank User",
    },
    routes: {
      home: {
        title: "Inicio",
      },
      about: {
        title: "Acerca de",
      },
      fallback: {
        title: "Página",
      },
    },
    shell: {
      skipLink: "Saltar al contenido principal",
      productLabel: "Frontend estándar",
      navigation: {
        main: "Navegación principal",
        footer: "Navegación del pie de página",
      },
      nav: {
        home: "Inicio",
        about: "Acerca de",
      },
      theme: {
        switchTo: "Cambiar a {{mode}}",
        system: "Automático",
        light: "Claro",
        dark: "Oscuro",
      },
      loading: "Cargando página…",
      footerLabel: "Plantilla de frontend estándar",
      routeAnnouncer: {
        loaded: "Página {{title}} cargada",
      },
    },
    home: {
      loading: "Cargando destacados…",
      error: {
        highlightsUnavailable: "No se pudieron cargar los destacados de la plantilla",
        demoFailure: "Fallo de demostración",
      },
      greeting: {
        morning: "Buenos días",
        afternoon: "Buenas tardes",
        evening: "Buenas noches",
      },
      hero: {
        title: "{{greeting}}! Esta es la plantilla de frontend estándar",
        subtitle:
          "Una arquitectura React 19 por funcionalidades (screaming) con una estructura accesible, estado de servidor y manejo tipado de errores.",
      },
      environment: {
        modeLabel: "Entorno:",
        apiBaseLabel: "Base de API:",
      },
      highlights: {
        listLabel: "Destacados de la plantilla",
        items: {
          shell: {
            title: "Estructura accesible",
            description:
              "Puntos de referencia, enlace de salto, anunciador de ruta y gestión del foco integrados en el diseño.",
          },
          data: {
            title: "Estado del servidor",
            description:
              "TanStack Query conectado mediante un QueryClientProvider con hooks y errores tipados.",
          },
          routing: {
            title: "Rutas diferidas",
            description: "React Router con división de código por ruta y límites de Suspense.",
          },
        },
      },
    },
    about: {
      heading: "Acerca de",
      title: "Plantilla de frontend estándar",
      description:
        "Una arquitectura React 19 por funcionalidades (screaming) con una estructura accesible, manejo tipado de errores, TanStack Query para el estado del servidor y rutas diferidas de React Router.",
    },
    error: {
      genericTitle: "Algo salió mal",
      genericMessage: "Ocurrió un error inesperado.",
      statusTitle: "Error {{status}}",
      routeFallbackMessage: "No se pudo cargar la página solicitada.",
      dataFetchTitle: "No se pudieron cargar los datos",
      retry: "Reintentar",
    },
    sample: {
      initialized: "La internacionalización está lista.",
    },
    ui: {
      close: "Cerrar",
      breadcrumb: {
        label: "Ruta de navegación",
        more: "Más",
      },
      pagination: {
        label: "Paginación",
        previous: "Anterior",
        next: "Siguiente",
        morePages: "Más páginas",
      },
    },
  },
};
