import type { AuthTranslationTree, TranslationTree } from "./en";

export const pt: { common: TranslationTree; auth: AuthTranslationTree } = {
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
      },
    },
  },
};
