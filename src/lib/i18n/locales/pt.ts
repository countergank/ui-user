import type {
  AuthTranslationTree,
  ConsoleTranslationTree,
  LandingTranslationTree,
  TranslationTree,
  UsersTranslationTree,
} from "./en";

export const pt: {
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
        title: "Início",
      },
      about: {
        title: "Sobre",
      },
      fallback: {
        title: "Página",
      },
    },
    shell: {
      skipLink: "Pular para o conteúdo principal",
      productLabel: "Frontend padrão",
      navigation: {
        main: "Navegação principal",
        footer: "Navegação do rodapé",
      },
      nav: {
        home: "Início",
        about: "Sobre",
      },
      language: {
        switch: "Mudar idioma",
      },
      theme: {
        switchTo: "Mudar para {{mode}}",
        system: "Automático",
        light: "Claro",
        dark: "Escuro",
      },
      loading: "Carregando página…",
      footerLabel: "Modelo de frontend padrão",
      routeAnnouncer: {
        loaded: "Página {{title}} carregada",
      },
    },
    error: {
      genericTitle: "Algo deu errado",
      genericMessage: "Ocorreu um erro inesperado.",
      statusTitle: "Erro {{status}}",
      routeFallbackMessage: "Não foi possível carregar a página solicitada.",
      dataFetchTitle: "Não foi possível carregar os dados",
      retry: "Tentar novamente",
    },
    sample: {
      initialized: "A internacionalização está pronta.",
    },
    ui: {
      close: "Fechar",
      breadcrumb: {
        label: "Trilha de navegação",
        more: "Mais",
      },
      pagination: {
        label: "Paginação",
        previous: "Anterior",
        next: "Próxima",
        morePages: "Mais páginas",
      },
      list: {
        filters: {
          all: "Todos",
        },
        pending: "Pendente de implementação",
        refresh: "Atualizar",
        clear: "Limpar filtros",
        empty: "Nenhum resultado",
        sort: {
          by: "Ordenar por {{column}}",
        },
        pagination: {
          summary: "Mostrando {{from}} a {{to}} de {{total}}",
          previous: "Página anterior",
          next: "Página seguinte",
          page: "Ir para a página {{page}}",
        },
      },
    },
  },
  landing: {
    title: "Countergank User",
    subtitle:
      "Um console open source para gerenciar os usuários, papéis e permissões de uma API da countergank.",
    nav: {
      label: "Navegação pública",
      home: "Início",
      about: "Sobre",
      signIn: "Entrar",
    },
    footer: {
      docs: "Documentação",
      repository: "Repositório",
      license: "Licença",
    },
    about: {
      title: "Sobre",
      standards: {
        title: "Como este projeto é construído",
        body: "O repositório carrega as regras que segue. Leia antes de contribuir.",
        adr: "Decisões de arquitetura",
        patterns: "Padrões de componentes",
        accessibility: "Acessibilidade",
        testing: "Testes",
      },
      contribute: {
        title: "Contribuir",
        body: "Issues e pull requests são bem-vindos. O fluxo de branches, as convenções de commit e o gate de review estão documentados no repositório.",
        cta: "Abrir uma issue",
      },
      body: "Countergank User faz parte do stack open source da countergank: o frontend da API de usuários, construído com o molde padrão de frontend (React 19, Vite, TypeScript estrito). Este repositório também guarda os padrões que o projeto segue — ADRs, padrões de componentes, acessibilidade, tratamento de erros e regras de testes — em docs/.",
    },
    what: {
      title: "O que é",
      body: "Countergank User é o console open source de gestão da API de usuários da countergank. É uma single-page app em React: fala com api-user por HTTP e não tem backend próprio.",
    },
    service: {
      title: "O que oferece",
      body: "Entrar contra a API e depois navegar e administrar usuários, papéis e permissões, e revisar a auditoria: a superfície diária de uma administração de usuários, sem construí-la do zero.",
    },
    features: {
      title: "O que inclui",
      items: {
        session: {
          title: "Sessão que se renova sozinha",
          description:
            "Access e refresh tokens, renovação proativa antes de expirar, um único refresh para 401 concorrentes e logout local primeiro.",
        },
        accessibility: {
          title: "Acessibilidade como piso",
          description:
            "Landmarks, skip link, anúncio de rotas, gestão de foco e axe na suíte de testes.",
        },
        languages: {
          title: "Três idiomas",
          description:
            "Inglês, espanhol e português do Brasil, com paridade de chaves exigida pelo sistema de tipos e pelos testes.",
        },
        typed: {
          title: "Tipagem de ponta a ponta",
          description:
            "TypeScript estrito, o envelope de erro da API tipado e um gateway de configuração que falha rápido quando falta uma variável.",
        },
      },
    },
    hero: {
      eyebrow: "Plataforma de administração de usuários",
      headline: "Permissões reais, sessões controladas, tudo auditado.",
      lead: "Um backend de gestão de usuários com RBAC de 22 permissões, revogação de sessões e auditoria por request. Este aplicativo é o console de administração.",
      ctaCapabilities: "Ver capacidades",
      chips: {
        jwt: "JWT + refresh",
        rbac: "RBAC 22 permissões",
        audit: "Auditoria por request",
      },
    },
    mock: {
      sidebar: {
        label: "GESTÃO",
        users: "Usuários",
        roles: "Papéis e permissões",
        audit: "Auditoria",
        settings: "Parâmetros",
      },
      search: {
        placeholder: "Buscar usuário…",
      },
      actions: {
        newUser: "Novo usuário",
      },
      kpi: {
        total: "TOTAL",
        totalValue: "1.248",
        active: "ATIVOS",
        activeValue: "1.187",
        blocked: "BLOQUEADOS",
        blockedValue: "12",
      },
      users: {
        leandro: {
          name: "Leandro Cepeda",
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
        active: "ativo",
        blocked: "bloqueado",
      },
    },
    quickstart: {
      title: "Rodar localmente",
      body: "O backend traz seu próprio stack Docker. Suba ele e depois rode o console contra ele:",
      command: "docker compose up",
      note: "O console roda em localhost:3001 e a API responde na URL de VITE_API_BASE_URL.",
      terminalLabel: "Comando de shell",
    },
    stack: {
      title: "Stack",
      body: "Node 22, Vite 6, React 19, TypeScript estrito, Tailwind + shadcn/ui, TanStack Query 5, React Router 7, Vitest + Testing Library + Playwright, Biome + ESLint.",
    },
  },
  auth: {
    login: {
      title: "Entrar",
      subtitle: "Acesse com sua conta de administrador.",
      fields: {
        email: "Email",
        password: "Senha",
      },
      remember: "Lembrar de mim",
      forgotPassword: "Esqueceu sua senha?",
      orDivider: "ou",
      submit: "Entrar",
      createAccount: "Criar uma conta",
      createAccountHint: "O registro público ainda não está disponível.",
      legal: {
        prefix: "Ao continuar você aceita os",
        terms: "termos",
        middle: "e a",
        privacy: "política de privacidade",
      },
      footer: {
        copyright: "© {{year}} Countergank · Argentina",
        backToSite: "Voltar ao site",
      },
      brand: {
        eyebrow: "CONSOLE DE ADMINISTRAÇÃO",
        status: "API · operacional",
        headline: "Gerencie usuários sem perder o rastro de nada.",
        lead: "Cada cadastro, cada permissão e cada sessão encerrada fica registrada com seu correlationId.",
        bullets: {
          rbac: "RBAC de 22 permissões com papéis editáveis",
          audit: "Auditoria por request com correlationId",
          revocation: "Revogação de sessões por epoch",
          templates: "Modelos de e-mail e parâmetros editáveis em tempo real",
        },
        services: "MongoDB replica set · Redis · v1.1.0",
      },
      showPassword: "Mostrar senha",
      hidePassword: "Ocultar senha",
      errors: {
        invalidCredentials: "O email ou a senha estão incorretos.",
        locked: "Esta conta está bloqueada. Tente mais tarde.",
        inactive: "Esta conta está inativa.",
        rateLimited: "Muitas tentativas. Aguarde um momento e tente novamente.",
        emailRequired: "Informe seu e-mail.",
        emailInvalid: "Informe um e-mail válido.",
        passwordRequired: "Informe sua senha.",
      },
    },
  },
  console: {
    nav: {
      label: "Seções do console",
      summary: "Resumo",
      users: "Usuários",
      roles: "Papéis",
      permissions: "Permissões",
      audit: "Auditoria",
      settings: "Configurações",
    },
    shell: {
      title: "Console Countergank",
      footerLabel: "Countergank User — console de administração",
      expandSidebar: "Expandir a navegação",
      collapseSidebar: "Recolher a navegação",
      openMenu: "Abrir o menu de navegação",
      userMenu: "Menu do usuário",
      profile: "Meu perfil",
      signOut: "Sair",
    },
    placeholder: {
      title: "Ainda não construída",
      body: "O shell do console está pronto. Esta seção chega com o seu próprio ticket.",
    },
    forbidden: {
      title: "Acesso negado",
      message:
        "Seu papel não inclui esta seção. Se você acredita que deveria, peça a um administrador para revisar suas permissões.",
    },
  },
  users: {
    list: {
      title: "Usuários",
      columns: {
        name: "Nome",
        email: "Email",
        userName: "Usuário",
        role: "Papel",
        status: "Status",
        createdAt: "Criado",
        actions: "Ações",
      },
      filters: {
        search: "Buscar usuários",
        role: "Papel",
        status: "Status",
        clear: "Limpar filtros",
      },
      empty: "Nenhum usuário encontrado",
      actions: {
        create: "Novo usuário",
        edit: "Editar",
        view: "Ver detalhes",
        activate: "Ativar",
        deactivate: "Desativar",
        unlock: "Desbloquear",
        delete: "Excluir",
      },
      status: {
        active: "Ativo",
        inactive: "Inativo",
      },
    },
    detail: {
      title: "Detalhe do usuário",
      loading: "Carregando usuário…",
      fields: {
        id: "ID do usuário",
        name: "Nome",
        lastName: "Sobrenome",
        email: "Email",
        userName: "Usuário",
        role: "Papel",
        status: "Status",
        createdAt: "Criado",
        updatedAt: "Atualizado",
      },
      status: {
        active: "Ativo",
        inactive: "Inativo",
      },
      actions: {
        edit: "Editar",
      },
      back: "Voltar para a lista",
      locked: "Bloqueado até",
      failedAttempts: "Tentativas de login malsucedidas",
      notFound: "Este usuário não existe ou foi excluído.",
    },
    create: {
      title: "Novo usuário",
      groups: {
        identity: "Identidade",
        access: "Acesso",
      },
      fields: {
        name: "Nome",
        lastName: "Sobrenome",
        email: "Email",
        userName: "Usuário",
        password: "Senha",
        confirmPassword: "Confirmar senha",
        role: "Papel",
      },
      submit: "Salvar",
      cancel: "Cancelar",
      success: "Usuário criado.",
      showPassword: "Mostrar senha",
      hidePassword: "Ocultar senha",
      errors: {
        fieldRequired: "Este campo é obrigatório.",
        emailInvalid: "Informe um email válido.",
        emailTaken: "Esse email já está registrado.",
        userNameTaken: "Esse nome de usuário já está em uso.",
        weakPassword:
          "Use de 8 a 64 caracteres com pelo menos uma letra minúscula, uma maiúscula, um dígito e um caractere não alfanumérico (por exemplo #, - ou ñ), sem caracteres repetidos consecutivos nem sequências comuns.",
        passwordMismatch: "As senhas não coincidem.",
      },
      passwordStrength: {
        label: "Força da senha: {{strength}}",
        weak: "Fraca",
        medium: "Média",
        strong: "Forte",
      },
    },
    edit: {
      title: "Editar usuário",
      loading: "Carregando usuário…",
      groups: {
        identity: "Identidade",
        access: "Acesso",
      },
      fields: {
        name: "Nome",
        lastName: "Sobrenome",
        email: "Email",
        userName: "Usuário",
        role: "Papel",
      },
      roleImpact: "Alterar o papel pode alterar as permissões efetivas deste usuário.",
      submit: "Salvar",
      cancel: "Cancelar",
      success: "Usuário atualizado.",
      errors: {
        fieldRequired: "Este campo é obrigatório.",
        emailInvalid: "Informe um email válido.",
      },
    },
  },
};
