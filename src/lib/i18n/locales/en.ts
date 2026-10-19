export const en = {
  common: {
    meta: {
      productName: "Countergank User",
    },
    routes: {
      home: {
        title: "Home",
      },
      about: {
        title: "About",
      },
      fallback: {
        title: "Page",
      },
    },
    shell: {
      skipLink: "Skip to main content",
      productLabel: "Standard Frontend",
      navigation: {
        main: "Main navigation",
        footer: "Footer navigation",
      },
      nav: {
        home: "Home",
        about: "About",
      },
      theme: {
        switchTo: "Switch to {{mode}}",
        system: "Automatic",
        light: "Light",
        dark: "Dark",
      },
      loading: "Loading page…",
      footerLabel: "Frontend Standard Template",
      routeAnnouncer: {
        loaded: "{{title}} page loaded",
      },
    },
    home: {
      loading: "Loading highlights…",
      error: {
        highlightsUnavailable: "Could not load template highlights",
        demoFailure: "Demo failure",
      },
      greeting: {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening",
      },
      hero: {
        title: "{{greeting}}! This is the standard frontend template",
        subtitle:
          "A screaming, feature-based React 19 architecture with an accessible shell, server state, and typed error handling.",
      },
      environment: {
        modeLabel: "Environment:",
        apiBaseLabel: "API base:",
      },
      highlights: {
        listLabel: "Template highlights",
        items: {
          shell: {
            title: "Accessible shell",
            description:
              "Landmarks, skip link, route announcer, and focus management baked into the layout.",
          },
          data: {
            title: "Server state",
            description:
              "TanStack Query wired through a QueryClientProvider with typed hooks and errors.",
          },
          routing: {
            title: "Lazy routes",
            description: "React Router with per-route code splitting and Suspense boundaries.",
          },
        },
      },
    },
    about: {
      heading: "About",
      title: "Standard Frontend Template",
      description:
        "A feature-based (screaming) React 19 architecture with an accessible shell, typed error handling, TanStack Query for server state, and lazy React Router routes.",
    },
    error: {
      genericTitle: "Something went wrong",
      genericMessage: "An unexpected error occurred.",
      statusTitle: "Error {{status}}",
      routeFallbackMessage: "The requested page could not be loaded.",
      dataFetchTitle: "Could not load data",
      retry: "Try again",
    },
    sample: {
      initialized: "Internationalization is ready.",
    },
    ui: {
      close: "Close",
      breadcrumb: {
        label: "Breadcrumb",
        more: "More",
      },
      pagination: {
        label: "Pagination",
        previous: "Previous",
        next: "Next",
        morePages: "More pages",
      },
    },
  },
  landing: {
    title: "Countergank User",
    subtitle:
      "An open-source console to manage the users, roles and permissions of a countergank API.",
    nav: {
      label: "Public navigation",
      home: "Home",
      about: "About",
      signIn: "Sign in",
    },
    footer: {
      docs: "Documentation",
      repository: "Repository",
      license: "License",
    },
    about: {
      title: "About",
    },
    what: {
      title: "What this is",
      body: "Countergank User is the open-source management console for the countergank user API. It is a React single-page app: it talks to api-user over HTTP and owns no other backend of its own.",
    },
    service: {
      title: "What it provides",
      body: "Sign in against the API, then browse and manage users, roles and permissions and review the audit trail — the day-to-day surface of user administration, without building one from scratch.",
    },
    features: {
      title: "What you get",
      items: {
        session: {
          title: "Session that renews itself",
          description:
            "Access and refresh tokens, proactive renewal before expiry, a single refresh for concurrent 401s, and a local-first logout.",
        },
        accessibility: {
          title: "Accessibility as a floor",
          description:
            "Landmarks, skip link, route announcements, focus management and axe in the test suite.",
        },
        languages: {
          title: "Three languages",
          description:
            "English, Spanish and Brazilian Portuguese, with key parity enforced by the type system and the tests.",
        },
        typed: {
          title: "Typed end to end",
          description:
            "Strict TypeScript, a typed error envelope from the API, and a runtime gate that fails fast on missing configuration.",
        },
      },
    },
    quickstart: {
      title: "Run it locally",
      body: "The backend ships with its own Docker stack. Start it, then run the console against it:",
      command: "docker compose up",
      note: "The console is served at localhost:3000 and the API answers at the URL in VITE_API_BASE_URL.",
    },
    stack: {
      title: "Stack",
      body: "Node 22, Vite 6, React 19, strict TypeScript, Tailwind + shadcn/ui, TanStack Query 5, React Router 7, Vitest + Testing Library + Playwright, Biome + ESLint.",
    },
  },
  auth: {
    login: {
      title: "Sign in",
      subtitle: "Access the user management console",
      fields: {
        email: "Email",
        password: "Password",
      },
      submit: "Sign in",
      forgotPassword: "Forgot your password?",
      errors: {
        invalidCredentials: "The email or password is incorrect.",
        locked: "This account is locked. Try again later.",
        inactive: "This account is inactive.",
        rateLimited: "Too many attempts. Wait a moment and try again.",
        emailRequired: "Enter your email.",
        emailInvalid: "Enter a valid email address.",
        passwordRequired: "Enter your password.",
      },
    },
  },
};

/** Shape every language bundle must satisfy. Derived from English, the source of truth. */
export type TranslationTree = typeof en.common;

/** Shape every `auth` bundle must satisfy. */
export type AuthTranslationTree = typeof en.auth;

/** Shape every `landing` bundle must satisfy. */
export type LandingTranslationTree = typeof en.landing;
