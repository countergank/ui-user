import type { AuthTranslationTree, LandingTranslationTree, TranslationTree } from "./en";

export const pt: {
  common: TranslationTree;
  auth: AuthTranslationTree;
  landing: LandingTranslationTree;
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
    home: {
      loading: "Carregando destaques…",
      error: {
        highlightsUnavailable: "Não foi possível carregar os destaques do modelo",
        demoFailure: "Falha de demonstração",
      },
      greeting: {
        morning: "Bom dia",
        afternoon: "Boa tarde",
        evening: "Boa noite",
      },
      hero: {
        title: "{{greeting}}! Este é o modelo de frontend padrão",
        subtitle:
          "Uma arquitetura React 19 por funcionalidades (screaming) com uma estrutura acessível, estado de servidor e tratamento tipado de erros.",
      },
      environment: {
        modeLabel: "Ambiente:",
        apiBaseLabel: "Base da API:",
      },
      highlights: {
        listLabel: "Destaques do modelo",
        items: {
          shell: {
            title: "Estrutura acessível",
            description:
              "Pontos de referência, link de pulo, anunciador de rota e gerenciamento de foco integrados na estrutura.",
          },
          data: {
            title: "Estado do servidor",
            description:
              "TanStack Query conectado por meio de um QueryClientProvider com hooks e erros tipados.",
          },
          routing: {
            title: "Rotas sob demanda",
            description: "React Router com divisão de código por rota e limites de Suspense.",
          },
        },
      },
    },
    about: {
      heading: "Sobre",
      title: "Modelo de frontend padrão",
      description:
        "Uma arquitetura React 19 por funcionalidades (screaming) com uma estrutura acessível, tratamento tipado de erros, TanStack Query para o estado do servidor e rotas sob demanda do React Router.",
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
    quickstart: {
      title: "Rodar localmente",
      body: "O backend traz seu próprio stack Docker. Suba ele e depois rode o console contra ele:",
      command: "docker compose up",
      note: "O console é servido em localhost:3000 e a API responde na URL de VITE_API_BASE_URL.",
    },
    stack: {
      title: "Stack",
      body: "Node 22, Vite 6, React 19, TypeScript estrito, Tailwind + shadcn/ui, TanStack Query 5, React Router 7, Vitest + Testing Library + Playwright, Biome + ESLint.",
    },
  },
  auth: {
    login: {
      title: "Entrar",
      subtitle: "Acesse o console de gestão de usuários",
      fields: {
        email: "Email",
        password: "Senha",
      },
      submit: "Entrar",
      forgotPassword: "Esqueceu sua senha?",
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
};
