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
      language: {
        switch: "Change language",
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
      list: {
        filters: {
          all: "All",
        },
        pending: "Pending implementation",
        refresh: "Refresh",
        clear: "Clear filters",
        empty: "No results found",
        sort: {
          by: "Sort by {{column}}",
        },
        pagination: {
          summary: "Showing {{from}} to {{to}} of {{total}}",
          previous: "Previous page",
          next: "Next page",
          page: "Go to page {{page}}",
        },
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
      product: "Product",
      capabilities: "Capabilities",
      security: "Security",
      sectionsLabel: "Sections",
      about: "About",
      signIn: "Sign in",
    },
    footer: {
      docs: "Documentation",
      repository: "Repository",
      license: "License",
      copyright: "© {{year}} Countergank · Argentina",
      github: "GitHub",
    },
    about: {
      title: "About",
      standards: {
        title: "How this project is built",
        body: "The repository carries the rules it follows. Read them before contributing.",
        adr: "Architecture decisions",
        patterns: "Component patterns",
        accessibility: "Accessibility",
        testing: "Testing",
      },
      contribute: {
        title: "Contributing",
        body: "Issues and pull requests are welcome. The branch flow, commit conventions and review gate are documented in the repository.",
        cta: "Open an issue",
      },
      body: "Countergank User is part of the countergank open-source stack: the frontend of the user API, built from the standard frontend mould (React 19, Vite, strict TypeScript). This repository also holds the standards the project follows — ADRs, component patterns, accessibility, error handling and testing rules — under docs/.",
    },
    capabilities: {
      eyebrow: "Capabilities",
      heading: "What the backend already solves",
      lead: "None of this is a mockup: these are endpoints in production",
      items: {
        rbac: {
          title: "Granular RBAC",
          description:
            "22 permissions in 2 categories and editable roles. Every action is authorized by permission, not by a hardcoded role.",
        },
        audit: {
          title: "Traceable audit",
          description:
            "Every request leaves a correlationId, user, method, endpoint, status and duration, with a before/after of the change.",
        },
        sessions: {
          title: "Revocable sessions",
          description:
            "Monotonic sessionEpoch: closing every session invalidates each refresh token issued before it, with no TTL.",
        },
        email: {
          title: "Transactional email",
          description:
            "Templates with slug, variables and state. Send by template or directly, with a log per provider.",
        },
        i18n: {
          title: "Hot i18n",
          description:
            "Translations reload without restarting the service (nestjs-i18n), with localized error messages.",
        },
        params: {
          title: "Live parameters",
          description:
            "SMTP, email provider, resend and throttler configurable by group and key, with no redeploy.",
        },
      },
    },
    security: {
      eyebrow: "Security",
      heading: "The threat model is in the design, not in the README.",
      lead: "Short access tokens, refresh with a verifiable epoch.",
      items: {
        jwt: {
          title: "JWT + refresh",
          description: "Short-lived access token, refresh verifiable by epoch.",
        },
        lockout: {
          title: "Lockout after failed attempts",
          description: "lockedUntil per account against brute force.",
        },
        emailChange: {
          title: "Email change in 2 steps",
          description: "Confirmation and revert tokens.",
        },
      },
    },
    cta: {
      heading: "Shall we start with your users?",
      lead: "Sign in with your administrator account or ask the team for access.",
    },
    hero: {
      eyebrow: "User administration platform",
      headline: "Real permissions, controlled sessions, everything audited.",
      lead: "A user management backend with 22-permission RBAC, session revocation and per-request audit. This app is its administration console.",
      ctaCapabilities: "See capabilities",
      chips: {
        jwt: "JWT + refresh",
        rbac: "RBAC 22 permissions",
        audit: "Audit per request",
      },
    },
    mock: {
      sidebar: {
        label: "MANAGEMENT",
        users: "Users",
        roles: "Roles & permissions",
        audit: "Audit",
        settings: "Settings",
      },
      search: {
        placeholder: "Search users…",
      },
      actions: {
        newUser: "New user",
      },
      kpi: {
        total: "TOTAL",
        totalValue: "1,248",
        active: "ACTIVE",
        activeValue: "1,187",
        blocked: "BLOCKED",
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
        active: "active",
        blocked: "blocked",
      },
    },
  },
  auth: {
    login: {
      title: "Sign in",
      subtitle: "Sign in with your administrator account.",
      fields: {
        email: "Email",
        password: "Password",
      },
      remember: "Remember me",
      forgotPassword: "Forgot your password?",
      orDivider: "or",
      submit: "Sign in",
      createAccount: "Create an account",
      createAccountHint: "Public registration is not available yet.",
      legal: {
        prefix: "By continuing you accept the",
        terms: "terms",
        middle: "and the",
        privacy: "privacy policy",
      },
      footer: {
        copyright: "© {{year}} Countergank · Argentina",
        backToSite: "Back to the site",
      },
      brand: {
        eyebrow: "ADMINISTRATION CONSOLE",
        status: "API · healthy",
        headline: "Manage users without losing track of anything.",
        lead: "Every account, permission and signed-out session is recorded with its correlationId.",
        bullets: {
          rbac: "22-permission RBAC with editable roles",
          audit: "Per-request audit trail with correlationId",
          revocation: "Session revocation by epoch",
          templates: "Email templates and hot-editable parameters",
        },
        services: "MongoDB replica set · Redis · v1.1.0",
      },
      showPassword: "Show password",
      hidePassword: "Hide password",
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
  console: {
    nav: {
      label: "Console sections",
      summary: "Summary",
      users: "Users",
      roles: "Roles",
      permissions: "Permissions",
      audit: "Audit",
      settings: "Settings",
    },
    shell: {
      title: "Countergank Console",
      footerLabel: "Countergank User — management console",
      expandSidebar: "Expand navigation",
      collapseSidebar: "Collapse navigation",
      openMenu: "Open navigation menu",
      userMenu: "User menu",
      profile: "My profile",
      signOut: "Sign out",
    },
    placeholder: {
      title: "Not built yet",
      body: "The console shell is ready. This section arrives with its own ticket.",
    },
    forbidden: {
      title: "Access denied",
      message:
        "Your role does not include this section. If you think it should, ask an administrator to review your permissions.",
    },
  },
  users: {
    list: {
      title: "Users",
      columns: {
        name: "Name",
        email: "Email",
        userName: "User",
        role: "Role",
        status: "Status",
        createdAt: "Created",
        actions: "Actions",
      },
      filters: {
        search: "Search users",
        role: "Role",
        status: "Status",
        clear: "Clear filters",
      },
      empty: "No users found",
      actions: {
        create: "New user",
        edit: "Edit",
        view: "View details",
        activate: "Activate",
        deactivate: "Deactivate",
        unlock: "Unlock",
        delete: "Delete",
      },
      status: {
        active: "Active",
        inactive: "Inactive",
      },
    },
    detail: {
      title: "User details",
      loading: "Loading user…",
      fields: {
        id: "User ID",
        name: "Name",
        lastName: "Last name",
        email: "Email",
        userName: "User",
        role: "Role",
        status: "Status",
        createdAt: "Created",
        updatedAt: "Updated",
      },
      status: {
        active: "Active",
        inactive: "Inactive",
      },
      actions: {
        edit: "Edit",
      },
      back: "Back to users",
      locked: "Locked until",
      failedAttempts: "Failed sign-in attempts",
      notFound: "This user does not exist or was deleted.",
    },
    create: {
      title: "New user",
      groups: {
        identity: "Identity",
        access: "Access",
      },
      fields: {
        name: "Name",
        lastName: "Last name",
        email: "Email",
        userName: "User",
        password: "Password",
        confirmPassword: "Confirm password",
        role: "Role",
      },
      submit: "Save",
      cancel: "Cancel",
      success: "User created.",
      showPassword: "Show password",
      hidePassword: "Hide password",
      errors: {
        fieldRequired: "This field is required.",
        emailInvalid: "Enter a valid email address.",
        emailTaken: "That email is already registered.",
        userNameTaken: "That user name is already taken.",
        weakPassword:
          "Use 8 to 64 characters with at least one lowercase letter, one uppercase letter, one digit and one non-alphanumeric character (for example #, - or ñ), without repeated consecutive characters or common sequences.",
        passwordMismatch: "Passwords do not match.",
      },
      passwordStrength: {
        label: "Password strength: {{strength}}",
        weak: "Weak",
        medium: "Medium",
        strong: "Strong",
      },
    },
    edit: {
      title: "Edit user",
      loading: "Loading user…",
      groups: {
        identity: "Identity",
        access: "Access",
      },
      fields: {
        name: "Name",
        lastName: "Last name",
        email: "Email",
        userName: "User",
        role: "Role",
      },
      roleImpact: "Changing the role may change the effective permissions of this user.",
      submit: "Save",
      cancel: "Cancel",
      success: "User updated.",
      errors: {
        fieldRequired: "This field is required.",
        emailInvalid: "Enter a valid email address.",
      },
    },
  },
};

export type TranslationTree = typeof en.common;

export type AuthTranslationTree = typeof en.auth;

export type LandingTranslationTree = typeof en.landing;

export type ConsoleTranslationTree = typeof en.console;

export type UsersTranslationTree = typeof en.users;
