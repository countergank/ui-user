import type {
  AuthTranslationTree,
  ConsoleTranslationTree,
  LandingTranslationTree,
  TranslationTree,
  UsersTranslationTree,
} from "./en";

export const es: {
  common: TranslationTree;
  auth: AuthTranslationTree;
  landing: LandingTranslationTree;
  console: ConsoleTranslationTree;
  users: UsersTranslationTree;
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
        group: "Tema",
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
      list: {
        filters: {
          all: "Todos",
        },
        pending: "Pendiente de implementación",
        refresh: "Actualizar",
        clear: "Limpiar filtros",
        empty: "No hay resultados",
        sort: {
          by: "Ordenar por {{column}}",
        },
        pagination: {
          summary: "Mostrando {{from}} - {{to}} de {{total}}",
          previous: "Página anterior",
          next: "Página siguiente",
          page: "Ir a la página {{page}}",
        },
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
      product: "Producto",
      capabilities: "Capacidades",
      security: "Seguridad",
      sectionsLabel: "Secciones",
      about: "Acerca de",
      signIn: "Iniciar sesión",
    },
    footer: {
      docs: "Documentación",
      repository: "Repositorio",
      license: "Licencia",
      copyright: "© {{year}} Countergank · Argentina",
      github: "GitHub",
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
    capabilities: {
      eyebrow: "Capacidades",
      heading: "Lo que el backend ya resuelve",
      lead: "Nada de esto es una maqueta: son endpoints en producción",
      items: {
        rbac: {
          title: "RBAC granular",
          description:
            "22 permisos en 2 categorías y roles editables. Cada acción se autoriza por permiso, no por rol hardcodeado.",
        },
        audit: {
          title: "Auditoría trazable",
          description:
            "Cada request deja correlationId, usuario, método, endpoint, status y duración. Con before/after del cambio.",
        },
        sessions: {
          title: "Sesiones revocables",
          description:
            "sessionEpoch monotónico: cerrar todas las sesiones invalida cada refresh token emitido antes, sin TTL.",
        },
        email: {
          title: "Email transaccional",
          description:
            "Plantillas con slug, variables y estado. Envío por plantilla o directo, con log por proveedor.",
        },
        i18n: {
          title: "i18n en caliente",
          description:
            "Traducciones recargables sin reiniciar el servicio (nestjs-i18n), con mensajes de error localizados.",
        },
        params: {
          title: "Parámetros vivos",
          description:
            "SMTP, proveedor de email, resend y throttler configurables por grupo y clave, sin redeploy.",
        },
      },
    },
    security: {
      eyebrow: "Seguridad",
      heading: "El modelo de amenaza está en el diseño, no en el README.",
      lead: "Access corto, refresh con epoch verificable.",
      items: {
        jwt: {
          title: "JWT + refresh",
          description: "Access corto, refresh con epoch verificable.",
        },
        lockout: {
          title: "Lockout por intentos",
          description: "lockedUntil por cuenta ante fuerza bruta.",
        },
        emailChange: {
          title: "Cambio de email en 2 pasos",
          description: "Token de confirmación y reversión.",
        },
      },
    },
    cta: {
      heading: "¿Empezamos por tus usuarios?",
      lead: "Iniciá sesión con tu cuenta de administrador o pedí acceso al equipo.",
    },
    hero: {
      eyebrow: "Plataforma de administración de usuarios",
      headline: "Permisos reales, sesiones controladas, todo auditado.",
      lead: "Un backend de gestión de usuarios con RBAC de 22 permisos, revocación de sesiones y auditoría por request. Esta aplicación es su consola de administración.",
      ctaCapabilities: "Ver capacidades",
      chips: {
        jwt: "JWT + refresh",
        rbac: "RBAC 22 permisos",
        audit: "Auditoría por request",
      },
    },
    mock: {
      sidebar: {
        label: "GESTIÓN",
        users: "Usuarios",
        roles: "Roles y permisos",
        audit: "Auditoría",
        settings: "Parámetros",
      },
      search: {
        placeholder: "Buscar usuario…",
      },
      actions: {
        newUser: "Nuevo usuario",
      },
      kpi: {
        total: "TOTAL",
        totalValue: "1.248",
        active: "ACTIVOS",
        activeValue: "1.187",
        blocked: "BLOQUEADOS",
        blockedValue: "12",
      },
      users: {
        ana: {
          name: "Ana Duarte",
          role: "admin",
        },
        marta: {
          name: "Marta Gómez",
          role: "user",
        },
        julian: {
          name: "Julián Pérez",
          role: "viewer",
        },
        diego: {
          name: "Diego Sosa",
        },
      },
      status: {
        active: "activo",
        blocked: "bloqueado",
      },
    },
  },
  auth: {
    login: {
      title: "Iniciá sesión",
      subtitle: "Accedé con tu cuenta de administrador.",
      fields: {
        email: "Email",
        password: "Contraseña",
      },
      remember: "Recordarme",
      forgotPassword: "¿Olvidaste tu contraseña?",
      orDivider: "o",
      submit: "Iniciar sesión",
      createAccount: "Crear una cuenta",
      createAccountHint: "El registro público todavía no está disponible.",
      legal: {
        prefix: "Al continuar aceptás los",
        terms: "términos",
        middle: "y la",
        privacy: "política de privacidad",
      },
      footer: {
        copyright: "© {{year}} Countergank · Argentina",
        backToSite: "Volver al sitio",
      },
      brand: {
        eyebrow: "CONSOLA DE ADMINISTRACIÓN",
        status: "API · healthy",
        headline: "Administrá usuarios sin perder el rastro de nada.",
        lead: "Cada alta, cada permiso y cada sesión cerrada queda registrada con su correlationId.",
        bullets: {
          rbac: "RBAC de 22 permisos con roles editables",
          audit: "Auditoría por request con correlationId",
          revocation: "Revocación de sesiones por epoch",
          templates: "Plantillas de email y parámetros en caliente",
        },
        services: "MongoDB replica set · Redis · v1.1.0",
      },
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
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
      home: "Inicio",
      users: "Usuarios",
      roles: "Roles y permisos",
      sessions: "Sesiones",
      audit: "Auditoría",
      emailTemplates: "Plantillas de email",
      deliveries: "Envíos",
      parameters: "Parámetros",
      i18n: "i18n",
      group: {
        management: "Gestión",
        system: "Sistema",
      },
      pending: "Próximamente",
    },
    shell: {
      title: "Consola Countergank",
      expandSidebar: "Expandir la navegación",
      collapseSidebar: "Colapsar la navegación",
      notifications: "Notificaciones",
      searchLabel: "Búsqueda global",
      searchPlaceholder: "Buscar nombre, email o @usuario",
      openMenu: "Abrir el menú de navegación",
      userMenu: "Menú de usuario",
      profile: "Mi perfil",
      signOut: "Cerrar sesión",
    },
    placeholder: {
      title: "Todavía no está construida",
      body: "El shell de la consola está listo. Esta sección llega con su propio ticket.",
    },
    forbidden: {
      title: "Acceso denegado",
      message:
        "Tu rol no incluye esta sección. Si creés que debería, pedile a un administrador que revise tus permisos.",
    },
  },
  users: {
    list: {
      side: {
        roles: {
          title: "Distribución por rol",
          footnote: "Roles de sistema · editables en Roles y permisos",
        },
        audit: {
          title: "Auditoría reciente",
          seeAll: "Ver todo",
          m2: "hace 2 min",
          m6: "hace 6 min",
          m14: "hace 14 min",
          m21: "hace 21 min",
          m38: "hace 38 min",
          m45: "hace 45 min",
        },
      },
      pageShort: "pág",
      pageSize: "Elementos por página",
      title: "Usuarios",
      subtitle: "{{count}} cuentas · {{roles}} roles de sistema · {{permissions}} permisos",
      footer: {
        range: "Mostrando {{from}} a {{to}} de {{total}}",
      },
      exportLabel: "Exportar CSV",
      pendingFeature: "Espera COU-347",
      kpi: {
        total: "Usuarios totales",
        active: "Usuarios activos",
        blocked: "Usuarios bloqueados",
        unverified: "Email sin verificar",
        totalHint: "+4,2% vs mes anterior",
        activeHint: "95,1% del total",
        blockedHint: "lockout por intentos",
        unverifiedHint: "reenviar verificación",
      },
      columns: {
        user: "Usuario",
        verification: "Email",
        name: "Nombre",
        email: "Email",
        userName: "Usuario",
        role: "Rol",
        status: "Estado",
        createdAt: "Creado",
        actions: "Acciones",
      },
      filters: {
        roles: "Roles",
        all: "Todos",
        search: "Buscar usuarios",
        role: "Rol",
        status: "Estado",
        clear: "Limpiar filtros",
      },
      empty: "No hay usuarios",
      actions: {
        create: "Nuevo usuario",
        edit: "Editar",
        more: "Más acciones",
        view: "Ver detalle",
        activate: "Activar",
        deactivate: "Desactivar",
        unlock: "Desbloquear",
        delete: "Eliminar",
      },
      status: {
        blocked: "Bloqueado",
        active: "Activo",
        inactive: "Inactivo",
      },
    },
    detail: {
      title: "Detalle de usuario",
      subtitle: "Ficha, permisos y acciones administrativas",
      loading: "Cargando usuario…",
      fields: {
        name: "Nombre",
        lastName: "Apellido",
        email: "Email",
        userName: "Usuario",
        role: "Rol",
        createdAt: "Creado",
        updatedAt: "Actualizado",
      },
      status: {
        active: "Activo",
        inactive: "Inactivo",
      },
      actions: {
        more: "Más acciones",
        edit: "Editar",
      },
      pending: "Pendiente de implementación",
      back: "Volver al listado",
      notFound: "Este usuario no existe o fue eliminado.",
      profile: {
        title: "Perfil",
        updated: "actualizado {{value}}",
      },
      permissions: {
        title: "Permisos efectivos",
        direct: "Directos:",
        groupUser: "USER",
        groupSystem: "SYSTEM",
      },
      sessions: {
        title: "Sesiones y seguridad",
        lastAccess: "Último acceso",
        activeDevices: "Sesiones activas",
        lock: "Bloqueo",
        noLock: "sin bloqueo (lockedUntil —)",
        failedAttempts: "Intentos fallidos",
        closeAll: "Cerrar todas las sesiones",
        closeAllHint: "POST /auth/logout-all · invalida todos los refresh",
      },
      adminActions: {
        title: "Acciones de administración",
        unlock: "Desbloquear cuenta",
        deactivate: "Desactivar usuario",
        resetPassword: "Restablecer contraseña",
        resendVerification: "Reenviar verificación",
        changeEmail: "Cambiar email (2 pasos)",
        delete: "Eliminar usuario",
      },
      accountStatus: {
        title: "Estado de la cuenta",
        pendingEmail: "Email pendiente",
        passwordReset: "Reset de contraseña",
        verification: "Verificación",
      },
      activity: {
        title: "Actividad del usuario",
        viewAll: "Ver todo",
      },
    },
    create: {
      title: "Nuevo usuario",
      subtitle: "Registra un nuevo usuario y asigna su rol.",
      groups: {
        identity: "Identidad",
        access: "Acceso",
      },
      fields: {
        name: "Nombre",
        lastName: "Apellido",
        email: "Email",
        userName: "Usuario",
        password: "Contraseña",
        confirmPassword: "Confirmar contraseña",
        role: "Rol",
      },
      submit: "Guardar",
      cancel: "Cancelar",
      success: "Usuario creado.",
      showPassword: "Mostrar contraseña",
      hidePassword: "Ocultar contraseña",
      errors: {
        fieldRequired: "Este campo es obligatorio.",
        emailInvalid: "Ingresá un email válido.",
        emailTaken: "Ese email ya está registrado.",
        userNameTaken: "Ese nombre de usuario ya está en uso.",
        weakPassword:
          "Usá entre 8 y 64 caracteres con al menos una minúscula, una mayúscula, un dígito y un carácter no alfanumérico (por ejemplo #, - o ñ), sin caracteres repetidos consecutivos ni secuencias comunes.",
        passwordMismatch: "Las contraseñas no coinciden.",
      },
      passwordStrength: {
        label: "Fortaleza de la contraseña: {{strength}}",
        weak: "Débil",
        medium: "Media",
        strong: "Fuerte",
      },
    },
    edit: {
      title: "Editar usuario",
      subtitle: "Actualiza el perfil y el rol de este usuario.",
      loading: "Cargando usuario…",
      groups: {
        identity: "Identidad",
        access: "Acceso",
      },
      fields: {
        name: "Nombre",
        lastName: "Apellido",
        email: "Email",
        userName: "Usuario",
        role: "Rol",
      },
      roleImpact: "Cambiar el rol puede cambiar los permisos efectivos de este usuario.",
      submit: "Guardar",
      cancel: "Cancelar",
      success: "Usuario actualizado.",
      errors: {
        fieldRequired: "Este campo es obligatorio.",
        emailInvalid: "Ingresá un email válido.",
      },
    },
  },
};
