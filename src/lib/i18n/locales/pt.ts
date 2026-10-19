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
