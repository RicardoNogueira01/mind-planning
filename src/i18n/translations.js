// Translation files for internationalization
export const translations = {
  en: {
    // Navigation
    nav: {
      brand: 'Attune',
      subtitle: 'Project Dashboard',
      search: 'Search projects, tasks, or team members...',
      notifications: 'Notifications',
      profile: 'Profile',
    },
    
    // Greeting
    greeting: {
      hello: 'Hello',
      subtitle: "Here's what's happening with your projects today",
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
    },
    
    // Stats
    stats: {
      overallProgress: 'Overall Progress',
      completed: 'Completed',
      inProgress: 'In Progress',
      toStart: 'To Start',
      taskStatus: 'Task Status',
      status: 'Status',
      notStarted: 'Not Started',
      overdue: 'Overdue',
      team: 'Team',
      members: 'Members',
      onTrack: '✓ On track',
      overdueTasks: 'overdue',
      viewAllMembers: 'View All Members',
      tasks: 'tasks',
    },
    
    // Holidays
    holidays: {
      title: 'Upcoming Holidays',
      subtitle: 'National holidays & celebrations',
      holidays: 'holidays',
      in: 'In',
      days: 'days',
      teamTitle: 'Team Holidays',
      teamSubtitle: 'Holiday requests',
      approved: 'Approved',
      pending: 'Pending',
      canceled: 'Canceled',
      viewAllRequests: 'View All Requests',
      reason: 'reason',
    },
    
    // Activity
    activity: {
      recentTitle: 'Recent Activity',
      recentSubtitle: 'Recently completed tasks',
      completedBy: 'Completed by',
      viewAll: 'View All',
      deadlinesTitle: 'Deadlines',
      deadlinesSubtitle: 'Upcoming due dates',
      assignedTo: 'Assigned to',
      due: 'Due',
      today: 'Today',
      tomorrow: 'Tomorrow',
      inDays: 'In',
    },
    
    // Buttons
    buttons: {
      openMindMaps: 'Open Mind Maps',
      viewAll: 'View All',
      manageTeam: 'Manage Team',
    },
    
    // User roles
    roles: {
      admin: 'Admin',
      manager: 'Manager',
      member: 'Member',
    },
  },
  
  pt: {
    // Navegação
    nav: {
      brand: 'Attune',
      subtitle: 'Painel de Projetos',
      search: 'Pesquisar projetos, tarefas ou membros da equipa...',
      notifications: 'Notificações',
      profile: 'Perfil',
    },
    
    // Saudação
    greeting: {
      hello: 'Olá',
      subtitle: 'Aqui está o resumo dos seus projetos hoje',
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo',
      january: 'Janeiro',
      february: 'Fevereiro',
      march: 'Março',
      april: 'Abril',
      may: 'Maio',
      june: 'Junho',
      july: 'Julho',
      august: 'Agosto',
      september: 'Setembro',
      october: 'Outubro',
      november: 'Novembro',
      december: 'Dezembro',
    },
    
    // Estatísticas
    stats: {
      overallProgress: 'Progresso Geral',
      completed: 'Concluídas',
      inProgress: 'Em Curso',
      toStart: 'Por Iniciar',
      taskStatus: 'Estado das Tarefas',
      status: 'Estado',
      notStarted: 'Não Iniciadas',
      overdue: 'Atrasadas',
      team: 'Equipa',
      members: 'Membros',
      onTrack: '✓ Em dia',
      overdueTasks: 'atrasadas',
      viewAllMembers: 'Ver Todos os Membros',
      tasks: 'tarefas',
    },
    
    // Feriados
    holidays: {
      title: 'Próximos Feriados',
      subtitle: 'Feriados nacionais e celebrações',
      holidays: 'feriados',
      in: 'Em',
      days: 'dias',
      teamTitle: 'Férias da Equipa',
      teamSubtitle: 'Pedidos de férias',
      approved: 'Aprovados',
      pending: 'Pendentes',
      canceled: 'Cancelados',
      viewAllRequests: 'Ver Todos os Pedidos',
      reason: 'motivo',
    },
    
    // Atividade
    activity: {
      recentTitle: 'Atividade Recente',
      recentSubtitle: 'Tarefas concluídas recentemente',
      completedBy: 'Concluída por',
      viewAll: 'Ver Todas',
      deadlinesTitle: 'Prazos',
      deadlinesSubtitle: 'Datas de entrega próximas',
      assignedTo: 'Atribuída a',
      due: 'Entrega',
      today: 'Hoje',
      tomorrow: 'Amanhã',
      inDays: 'Em',
    },
    
    // Botões
    buttons: {
      openMindMaps: 'Abrir Mapas Mentais',
      viewAll: 'Ver Tudo',
      manageTeam: 'Gerir Equipa',
    },
    
    // Funções de utilizador
    roles: {
      admin: 'Administrador',
      manager: 'Gestor',
      member: 'Membro',
    },
  },
};

// Get translation
export const t = (key, language = 'en') => {
  const keys = key.split('.');
  let value = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};
