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
