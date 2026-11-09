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
        group: "Theme",
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
      traceId: {
        copy: "Copy trace identifier",
        copyFailed: "Copy failed",
        copied: "Copied",
      },
      genericTitle: "Something went wrong",
      genericMessage: "An unexpected error occurred.",
      statusTitle: "Error {{status}}",
      routeFallbackMessage: "The requested page could not be loaded.",
      dataFetchTitle: "Could not load data",
      retry: "Try again",
      family: {
        request: "The request could not be completed.",
        server: "A server error occurred. Please try again.",
      },
      ua: {
        "UA-COM-001": "Something went wrong on our side. Please try again.",
        "UA-COM-002": "The requested item does not exist.",
        "UA-COM-003": "That name is already in use.",
        "UA-COM-004": "That email is already in use.",
        "UA-COM-005": "Some fields need attention.",
        "UA-APP-001": "An application error occurred.",
        "UA-APP-002": "The requested app version does not exist.",
        "UA-APP-003": "A service is temporarily unavailable. Try again in a moment.",
        "UA-USR-001": "That user does not exist.",
        "UA-USR-002": "That user was already deleted.",
        "UA-USR-003": "The current password is incorrect.",
        "UA-USR-004": "That email is already registered.",
        "UA-RBAC-001": "This role is assigned to one or more users and cannot be removed.",
        "UA-AUTH-001": "That email or username is already taken.",
        "UA-AUTH-002": "Incorrect email or password.",
        "UA-AUTH-003":
          "The account is temporarily locked after too many failed attempts. Try again later.",
        "UA-AUTH-004": "This account is inactive. Contact an administrator.",
        "UA-AUTH-005": "The password reset link is invalid or expired.",
        "UA-AUTH-006": "The verification link is invalid or expired.",
        "UA-AUTH-007": "The confirmation link is invalid or expired.",
        "UA-AUTH-008": "There is no pending email change.",
        "UA-AUTH-009": "Your session expired. Sign in again.",
        "UA-AUTH-010": "The email change code is invalid or expired.",
        "UA-AUTH-011": "The window to revert the email change has expired.",
        "UA-SEC-001": "Your session is invalid or expired. Sign in again.",
        "UA-SEC-002": "You do not have permission to do this.",
        "UA-EML-001": "A template with that slug already exists.",
        "UA-EML-002": "That template does not exist.",
        "UA-EML-003": "The default template file could not be found.",
        "UA-PAR-001": "That parameter does not exist.",
        "UA-PAR-002": "This parameter is overridden by the environment and cannot be changed here.",
        "UA-PAR-003": "The value for this parameter is invalid.",
      },
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
          summary: "Showing {{from}} - {{to}} of {{total}}",
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
      home: "Home",
      users: "Users",
      roles: "Roles and permissions",
      sessions: "Sessions",
      audit: "Audit",
      emailTemplates: "Email templates",
      deliveries: "Deliveries",
      parameters: "Parameters",
      i18n: "i18n",
      group: {
        management: "Management",
        system: "System",
      },
      pending: "Coming soon",
    },
    shell: {
      title: "Countergank Console",
      expandSidebar: "Expand navigation",
      collapseSidebar: "Collapse navigation",
      notifications: "Notifications",
      searchLabel: "Global search",
      searchPlaceholder: "Search name, email or @username",
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
      side: {
        roles: {
          title: "Role distribution",
          footnote: "System roles · editable in Roles and permissions",
        },
        audit: {
          title: "Recent audit",
          seeAll: "See all",
          m2: "2 min ago",
          m6: "6 min ago",
          m14: "14 min ago",
          m21: "21 min ago",
          m38: "38 min ago",
          m45: "45 min ago",
        },
      },
      pageShort: "page",
      pageSize: "Items per page",
      title: "Users",
      subtitle: "{{count}} accounts · {{roles}} system roles · {{permissions}} permissions",
      footer: {
        range: "Showing {{from}} to {{to}} of {{total}}",
      },
      exportLabel: "Export CSV",
      pendingFeature: "Waiting for COU-347",
      kpi: {
        total: "Total users",
        active: "Active users",
        blocked: "Blocked users",
        unverified: "Unverified email",
        totalHint: "+4.2% vs last month",
        activeHint: "95.1% of the total",
        blockedHint: "lockout by attempts",
        unverifiedHint: "resend verification",
      },
      columns: {
        user: "User",
        verification: "Email",
        name: "Name",
        email: "Email",
        userName: "User",
        role: "Role",
        status: "Status",
        createdAt: "Created",
        actions: "Actions",
      },
      filters: {
        roles: "Roles",
        all: "All",
        search: "Search users",
        role: "Role",
        status: "Status",
        clear: "Clear filters",
      },
      empty: "No users found",
      actions: {
        create: "New user",
        edit: "Edit",
        more: "More actions",
        view: "View details",
        activate: "Activate",
        deactivate: "Deactivate",
        unlock: "Unlock",
        delete: "Delete",
      },
      status: {
        blocked: "Blocked",
        active: "Active",
        inactive: "Inactive",
      },
      verification: {
        verified: "Verified",
        pending: "Pending",
      },
    },
    active: {
      confirmTitle: "Confirm status change",
      confirmBody: "This will immediately change {{name}}'s access.",
      deactivate: "Deactivate",
      activate: "Activate",
      success: "User status updated.",
      selfBlocked: "You cannot deactivate your own user.",
    },
    detail: {
      title: "User details",
      subtitle: "Profile, permissions and administrative actions",
      loading: "Loading user…",
      fields: {
        name: "Name",
        lastName: "Last name",
        email: "Email",
        userName: "User",
        role: "Role",
        createdAt: "Created",
        updatedAt: "Updated",
      },
      status: {
        active: "Active",
        inactive: "Inactive",
      },
      actions: {
        more: "More actions",
        edit: "Edit",
      },
      pending: "Pending implementation",
      back: "Back to users",
      notFound: "This user does not exist or was deleted.",
      profile: {
        title: "Profile",
        updated: "updated {{value}}",
      },
      permissions: {
        title: "Effective permissions",
        direct: "Direct:",
        groupUser: "USER",
        groupSystem: "SYSTEM",
      },
      sessions: {
        title: "Sessions and security",
        lastAccess: "Last access",
        activeDevices: "Active sessions",
        lock: "Lock",
        noLock: "no lock (lockedUntil —)",
        failedAttempts: "Failed attempts",
        closeAll: "Close all sessions",
        closeAllHint: "POST /auth/logout-all · invalidates every refresh token",
      },
      adminActions: {
        title: "Administrative actions",
        unlock: "Unlock account",
        deactivate: "Deactivate user",
        resetPassword: "Reset password",
        resendVerification: "Resend verification",
        changeEmail: "Change email (2 steps)",
        delete: "Delete user",
      },
      accountStatus: {
        title: "Account status",
        pendingEmail: "Pending email",
        passwordReset: "Password reset",
        verification: "Verification",
        yes: "Yes",
        no: "No",
      },
      activity: {
        title: "User activity",
        viewAll: "View all",
      },
    },
    create: {
      title: "New user",
      subtitle: "Register a new user and assign its role.",
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
      subtitle: "Update the profile and the role of this user.",
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
  email: {
    templates: {
      title: "Email templates",
      subtitle: "{{count}} templates in the catalog",
      columns: {
        name: "Template",
        subject: "Subject",
        status: "Status",
        version: "Version",
        updatedAt: "Updated",
        actions: "Actions",
      },
      filters: {
        status: "Status",
        all: "All",
        active: "Active",
        inactive: "Inactive",
        clear: "Clear filters",
      },
      empty: "No templates found",
      actions: {
        create: "New template",
        edit: "Edit",
        preview: "Preview",
        test: "Send test",
        delete: "Delete",
      },
      status: {
        active: "Active",
        inactive: "Inactive",
      },
      editor: {
        createTitle: "New template",
        editTitle: "Edit template",
        name: "Name",
        slug: "Slug",
        slugHint: "Lowercase identifier used by the API, e.g. password-reset.",
        subject: "Subject",
        body: "Body",
        variables: "Variables",
        variablesHint: "Use them in the subject or body as {{variable}}.",
        variablesEmpty: "No variables declared.",
        addVariable: "Add variable",
        active: "Active",
        save: "Save",
        saving: "Saving…",
        cancel: "Cancel",
        preview: "Preview",
      },
      preview: {
        title: "Preview",
        sampleNote: "Rendered with sample data.",
        close: "Close",
      },
      test: {
        title: "Send test email",
        description: "The template is rendered with sample values and sent to one recipient.",
        to: "Recipient",
        toPlaceholder: "name@example.com",
        send: "Send",
        sending: "Sending…",
        success: "Test email sent to {{to}}.",
        emailInvalid: "Enter a valid email address.",
      },
      delete: {
        title: "Delete template",
        body: "This permanently deletes the template {{name}}. Emails that use it will stop sending.",
        confirm: "Delete",
        cancel: "Cancel",
      },
      success: "Template saved.",
      deleteSuccess: "Template deleted.",
      errors: {
        fieldRequired: "This field is required.",
        slugInvalid: "Use lowercase letters, numbers and hyphens.",
        subjectRequired: "The subject is required.",
        bodyRequired: "The body is required.",
      },
    },
  },
  profile: {
    view: {
      heading: "My profile",
      title: "Personal data",
      subtitle: "Your personal account information.",
      loading: "Loading profile…",
    },
    fields: {
      name: "Name",
      lastName: "Last name",
      email: "Email",
      readOnly: "Read only",
    },
    actions: {
      changePhoto: "Change profile photo",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
    },
    success: {
      updated: "Profile updated.",
    },
    errors: {
      saveFailure: "The profile could not be saved. Try again.",
      fieldRequired: "This field is required.",
    },
  },
};

export type TranslationTree = typeof en.common;

export type AuthTranslationTree = typeof en.auth;

export type LandingTranslationTree = typeof en.landing;

export type ConsoleTranslationTree = typeof en.console;

export type UsersTranslationTree = typeof en.users;

export type EmailTranslationTree = typeof en.email;

export type ProfileTranslationTree = typeof en.profile;
