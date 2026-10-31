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
        group: "Tema",
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
          summary: "Mostrando {{from}} - {{to}} de {{total}}",
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
      product: "Produto",
      capabilities: "Capacidades",
      security: "Segurança",
      sectionsLabel: "Seções",
      about: "Sobre",
      signIn: "Entrar",
    },
    footer: {
      docs: "Documentação",
      repository: "Repositório",
      license: "Licença",
      copyright: "© {{year}} Countergank · Argentina",
      github: "GitHub",
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
    capabilities: {
      eyebrow: "Capacidades",
      heading: "O que o backend já resolve",
      lead: "Nada disso é uma maquete: são endpoints em produção",
      items: {
        rbac: {
          title: "RBAC granular",
          description:
            "22 permissões em 2 categorias e papéis editáveis. Cada ação é autorizada por permissão, não por papel hardcoded.",
        },
        audit: {
          title: "Auditoria rastreável",
          description:
            "Cada request deixa correlationId, usuário, método, endpoint, status e duração. Com before/after da mudança.",
        },
        sessions: {
          title: "Sessões revogáveis",
          description:
            "sessionEpoch monotônico: encerrar todas as sessões invalida cada refresh token emitido antes, sem TTL.",
        },
        email: {
          title: "E-mail transacional",
          description:
            "Modelos com slug, variáveis e estado. Envio por modelo ou direto, com log por provedor.",
        },
        i18n: {
          title: "i18n a quente",
          description:
            "Traduções recarregáveis sem reiniciar o serviço (nestjs-i18n), com mensagens de erro localizadas.",
        },
        params: {
          title: "Parâmetros vivos",
          description:
            "SMTP, provedor de e-mail, resend e throttler configuráveis por grupo e chave, sem redeploy.",
        },
      },
    },
    security: {
      eyebrow: "Segurança",
      heading: "O modelo de ameaça está no design, não no README.",
      lead: "Access curto, refresh com epoch verificável.",
      items: {
        jwt: {
          title: "JWT + refresh",
          description: "Access curto, refresh verificável por epoch.",
        },
        lockout: {
          title: "Lockout por tentativas",
          description: "lockedUntil por conta contra força bruta.",
        },
        emailChange: {
          title: "Troca de e-mail em 2 etapas",
          description: "Token de confirmação e reversão.",
        },
      },
    },
    cta: {
      heading: "Começamos pelos seus usuários?",
      lead: "Entre com sua conta de administrador ou peça acesso ao time.",
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
        active: "ativo",
        blocked: "bloqueado",
      },
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
      home: "Início",
      users: "Usuários",
      roles: "Papéis e permissões",
      sessions: "Sessões",
      audit: "Auditoria",
      emailTemplates: "Modelos de e-mail",
      deliveries: "Envios",
      parameters: "Parâmetros",
      i18n: "i18n",
      group: {
        management: "Gestão",
        system: "Sistema",
      },
      pending: "Em breve",
    },
    shell: {
      title: "Console Countergank",
      expandSidebar: "Expandir a navegação",
      collapseSidebar: "Recolher a navegação",
      notifications: "Notificações",
      searchLabel: "Busca global",
      searchPlaceholder: "Buscar nome, email ou @usuário",
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
      side: {
        roles: {
          title: "Distribuição por papel",
          footnote: "Papéis de sistema · editáveis em Papéis e permissões",
        },
        audit: {
          title: "Auditoria recente",
          seeAll: "Ver tudo",
          m2: "há 2 min",
          m6: "há 6 min",
          m14: "há 14 min",
          m21: "há 21 min",
          m38: "há 38 min",
          m45: "há 45 min",
        },
      },
      pageShort: "pág",
      pageSize: "Itens por página",
      title: "Usuários",
      subtitle: "{{count}} contas · {{roles}} papéis de sistema · {{permissions}} permissões",
      footer: {
        range: "Mostrando {{from}} a {{to}} de {{total}}",
      },
      exportLabel: "Exportar CSV",
      pendingFeature: "Aguardando COU-347",
      kpi: {
        total: "Usuários totais",
        active: "Usuários ativos",
        blocked: "Usuários bloqueados",
        unverified: "Email sem verificar",
        totalHint: "+4,2% vs mês anterior",
        activeHint: "95,1% do total",
        blockedHint: "lockout por tentativas",
        unverifiedHint: "reenviar verificação",
      },
      columns: {
        user: "Usuário",
        verification: "Email",
        name: "Nome",
        email: "Email",
        userName: "Usuário",
        role: "Papel",
        status: "Status",
        createdAt: "Criado",
        actions: "Ações",
      },
      filters: {
        roles: "Papéis",
        all: "Todos",
        search: "Buscar usuários",
        role: "Papel",
        status: "Status",
        clear: "Limpar filtros",
      },
      empty: "Nenhum usuário encontrado",
      actions: {
        create: "Novo usuário",
        edit: "Editar",
        more: "Mais ações",
        view: "Ver detalhes",
        activate: "Ativar",
        deactivate: "Desativar",
        unlock: "Desbloquear",
        delete: "Excluir",
      },
      status: {
        blocked: "Bloqueado",
        active: "Ativo",
        inactive: "Inativo",
      },
    },
    detail: {
      title: "Detalhe do usuário",
      subtitle: "Ficha, permissões e ações administrativas",
      loading: "Carregando usuário…",
      fields: {
        name: "Nome",
        lastName: "Sobrenome",
        email: "Email",
        userName: "Usuário",
        role: "Papel",
        createdAt: "Criado",
        updatedAt: "Atualizado",
      },
      status: {
        active: "Ativo",
        inactive: "Inativo",
      },
      actions: {
        more: "Mais ações",
        edit: "Editar",
      },
      pending: "Pendente de implementação",
      back: "Voltar para a lista",
      notFound: "Este usuário não existe ou foi excluído.",
      profile: {
        title: "Perfil",
        updated: "atualizado {{value}}",
      },
      permissions: {
        title: "Permissões efetivas",
        direct: "Diretos:",
        groupUser: "USER",
        groupSystem: "SYSTEM",
      },
      sessions: {
        title: "Sessões e segurança",
        lastAccess: "Último acesso",
        activeDevices: "Sessões ativas",
        lock: "Bloqueio",
        noLock: "sem bloqueio (lockedUntil —)",
        failedAttempts: "Tentativas malsucedidas",
        closeAll: "Encerrar todas as sessões",
        closeAllHint: "POST /auth/logout-all · invalida todos os refresh",
      },
      adminActions: {
        title: "Ações administrativas",
        unlock: "Desbloquear conta",
        deactivate: "Desativar usuário",
        resetPassword: "Redefinir senha",
        resendVerification: "Reenviar verificação",
        changeEmail: "Alterar email (2 passos)",
        delete: "Excluir usuário",
      },
      accountStatus: {
        title: "Estado da conta",
        pendingEmail: "Email pendente",
        passwordReset: "Reset de senha",
        verification: "Verificação",
      },
      activity: {
        title: "Atividade do usuário",
        viewAll: "Ver tudo",
      },
    },
    create: {
      title: "Novo usuário",
      subtitle: "Cadastra um novo usuário e atribui o papel dele.",
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
      subtitle: "Atualiza o perfil e o papel deste usuário.",
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
