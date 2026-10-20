import type {
  AuthTranslationTree,
  ConsoleTranslationTree,
  LandingTranslationTree,
  TranslationTree,
} from "./en";

export const es: {
  common: TranslationTree;
  auth: AuthTranslationTree;
  landing: LandingTranslationTree;
  console: ConsoleTranslationTree;
} = {
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
      language: {
        switch: "Cambiar idioma",
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
  landing: {
    title: "Countergank User",
    subtitle:
      "Una consola open source para gestionar los usuarios, roles y permisos de una API de countergank.",
    nav: {
      label: "Navegación pública",
      home: "Inicio",
      about: "Acerca de",
      signIn: "Iniciar sesión",
    },
    footer: {
      docs: "Documentación",
      repository: "Repositorio",
      license: "Licencia",
    },
    about: {
      title: "Acerca de",
      standards: {
        title: "Cómo se construye el proyecto",
        body: "El repositorio lleva escritas las reglas que sigue. Leelas antes de contribuir.",
        adr: "Decisiones de arquitectura",
        patterns: "Patrones de componentes",
        accessibility: "Accesibilidad",
        testing: "Testing",
      },
      contribute: {
        title: "Contribuir",
        body: "Los issues y pull requests son bienvenidos. El flujo de ramas, las convenciones de commit y el gate de review están documentados en el repositorio.",
        cta: "Abrir un issue",
      },
      body: "Countergank User es parte del stack open source de countergank: el frontend de la API de usuarios, construido con el molde estándar de frontend (React 19, Vite, TypeScript estricto). Este repositorio también guarda los estándares que sigue el proyecto — ADRs, patrones de componentes, accesibilidad, manejo de errores y reglas de testing — en docs/.",
    },
    what: {
      title: "Qué es",
      body: "Countergank User es la consola open source de gestión de la API de usuarios de countergank. Es una single-page app en React: habla con api-user por HTTP y no tiene backend propio.",
    },
    service: {
      title: "Qué ofrece",
      body: "Iniciar sesión contra la API y después recorrer y administrar usuarios, roles y permisos, y revisar la auditoría: la superficie diaria de una administración de usuarios, sin construirla desde cero.",
    },
    features: {
      title: "Qué incluye",
      items: {
        session: {
          title: "Sesión que se renueva sola",
          description:
            "Access y refresh tokens, renovación proactiva antes de vencer, un solo refresh para 401 concurrentes y logout local primero.",
        },
        accessibility: {
          title: "Accesibilidad como piso",
          description:
            "Landmarks, skip link, anuncio de rutas, manejo de foco y axe en la suite de tests.",
        },
        languages: {
          title: "Tres idiomas",
          description:
            "Inglés, español y portugués de Brasil, con paridad de claves exigida por el sistema de tipos y los tests.",
        },
        typed: {
          title: "Tipado de punta a punta",
          description:
            "TypeScript estricto, el envelope de error de la API tipado, y un gateway de configuración que falla rápido si falta una variable.",
        },
      },
    },
    hero: {
      ctaRepository: "Ver el repositorio",
      ctaDocs: "Leer la documentación",
    },
    quickstart: {
      title: "Correrlo en local",
      body: "El backend trae su propio stack de Docker. Levantalo y después corré la consola contra él:",
      command: "docker compose up",
      note: "La consola se sirve en localhost:3000 y la API responde en la URL de VITE_API_BASE_URL.",
      terminalLabel: "Comando de shell",
    },
    stack: {
      title: "Stack",
      body: "Node 22, Vite 6, React 19, TypeScript estricto, Tailwind + shadcn/ui, TanStack Query 5, React Router 7, Vitest + Testing Library + Playwright, Biome + ESLint.",
    },
  },
  auth: {
    login: {
      title: "Iniciar sesión",
      subtitle: "Accedé a la consola de gestión de usuarios",
      fields: {
        email: "Email",
        password: "Contraseña",
      },
      submit: "Iniciar sesión",
      forgotPassword: "¿Olvidaste tu contraseña?",
      errors: {
        invalidCredentials: "El email o la contraseña son incorrectos.",
        locked: "Esta cuenta está bloqueada. Probá más tarde.",
        inactive: "Esta cuenta está inactiva.",
        rateLimited: "Demasiados intentos. Esperá un momento y volvé a intentar.",
        emailRequired: "Ingresá tu email.",
        emailInvalid: "Ingresá un email válido.",
        passwordRequired: "Ingresá tu contraseña.",
      },
    },
  },
  console: {
    nav: {
      label: "Secciones de la consola",
      summary: "Resumen",
      users: "Usuarios",
      roles: "Roles",
      permissions: "Permisos",
      audit: "Auditoría",
      settings: "Configuración",
    },
    forbidden: {
      title: "Acceso denegado",
      message:
        "Tu rol no incluye esta sección. Si creés que debería, pedile a un administrador que revise tus permisos.",
    },
  },
};
