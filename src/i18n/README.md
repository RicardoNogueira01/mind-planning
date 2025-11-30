# Sistema de Internacionalização (i18n)

## Visão Geral
Sistema completo de tradução para Inglês e Português implementado no Mind Planning.

## Estrutura

### Ficheiros Principais
- **translations.js** - Contém todas as traduções em inglês e português
- **LanguageContext.jsx** - Context Provider React para gestão de idioma

## Como Usar

### 1. Usar Traduções num Componente
```jsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t, language, toggleLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('nav.brand')}</h1>
      <p>{t('greeting.hello')}</p>
      <button onClick={toggleLanguage}>
        Change Language
      </button>
    </div>
  );
}
```

### 2. Adicionar Novas Traduções
Edite `translations.js`:
```javascript
export const translations = {
  en: {
    myNewSection: {
      title: 'My Title',
      description: 'My Description'
    }
  },
  pt: {
    myNewSection: {
      title: 'Meu Título',
      description: 'Minha Descrição'
    }
  }
};
```

Use no componente:
```jsx
{t('myNewSection.title')}
```

## Chaves de Tradução Disponíveis

### Navegação (`nav.*`)
- `nav.brand` - Nome da aplicação
- `nav.subtitle` - Subtítulo do dashboard
- `nav.search` - Placeholder da barra de pesquisa
- `nav.notifications` - Notificações
- `nav.profile` - Perfil

### Saudação (`greeting.*`)
- `greeting.hello` - Olá/Hello
- `greeting.subtitle` - Subtítulo da saudação
- Dias da semana: `greeting.monday`, `greeting.tuesday`, etc.
- Meses: `greeting.january`, `greeting.february`, etc.

### Estatísticas (`stats.*`)
- `stats.overallProgress` - Progresso Geral
- `stats.completed` - Concluídas
- `stats.inProgress` - Em Curso
- `stats.toStart` - Por Iniciar
- `stats.taskStatus` - Estado das Tarefas
- `stats.notStarted` - Não Iniciadas
- `stats.overdue` - Atrasadas
- `stats.team` - Equipa
- `stats.members` - Membros
- `stats.onTrack` - Em dia
- `stats.overdueTasks` - atrasadas
- `stats.viewAllMembers` - Ver Todos os Membros

### Feriados (`holidays.*`)
- `holidays.title` - Próximos Feriados
- `holidays.subtitle` - Feriados nacionais e celebrações
- `holidays.holidays` - feriados
- `holidays.in` - Em
- `holidays.days` - dias
- `holidays.teamTitle` - Férias da Equipa
- `holidays.teamSubtitle` - Pedidos de férias
- `holidays.approved` - Aprovados
- `holidays.pending` - Pendentes
- `holidays.canceled` - Cancelados
- `holidays.viewAllRequests` - Ver Todos os Pedidos

### Atividade (`activity.*`)
- `activity.recentTitle` - Atividade Recente
- `activity.recentSubtitle` - Tarefas concluídas recentemente
- `activity.completedBy` - Concluída por
- `activity.viewAll` - Ver Todas
- `activity.deadlinesTitle` - Prazos
- `activity.deadlinesSubtitle` - Datas de entrega próximas
- `activity.assignedTo` - Atribuída a
- `activity.due` - Entrega
- `activity.today` - Hoje
- `activity.tomorrow` - Amanhã
- `activity.inDays` - Em

### Botões (`buttons.*`)
- `buttons.openMindMaps` - Abrir Mapas Mentais
- `buttons.viewAll` - Ver Tudo
- `buttons.manageTeam` - Gerir Equipa

### Funções (`roles.*`)
- `roles.admin` - Administrador
- `roles.manager` - Gestor
- `roles.member` - Membro

## Funcionalidades

### Botão de Troca de Idioma
- Localizado na barra de navegação superior
- Exibe "EN" ou "PT" conforme o idioma atual
- Clique para alternar entre inglês e português
- Idioma é guardado no `localStorage`

### Persistência
O idioma selecionado é automaticamente guardado no navegador e restaurado na próxima visita.

### Idioma Padrão
Inglês (EN) é o idioma padrão da aplicação.

## Exemplos de Uso

### Texto Simples
```jsx
<h1>{t('nav.brand')}</h1>
```

### Com Variáveis
```jsx
<p>{collaborators.length} {t('stats.members')}</p>
```

### Lógica Condicional
```jsx
{collab.overdueTasks > 0 
  ? `${collab.overdueTasks} ${t('stats.overdueTasks')}` 
  : t('stats.onTrack')
}
```

### Formatação Dinâmica
```jsx
const formatDueDate = (dueDate) => {
  if (dueDate === 'today') return t('activity.today');
  if (dueDate === 'tomorrow') return t('activity.tomorrow');
  return `${t('activity.inDays')} ${dueDate} ${t('holidays.days')}`;
};
```

## Notas Importantes

1. **Sempre use a função `t()`** para traduzir texto
2. **Não hardcode texto** - adicione à `translations.js`
3. **Mantenha consistência** nas chaves de tradução
4. **Teste ambos os idiomas** após adicionar novas traduções
5. **Use nomes de chaves descritivos** e hierárquicos

## Manutenção

Ao adicionar nova funcionalidade:
1. Adicione as traduções em ambos os idiomas
2. Use a função `t()` no componente
3. Teste a troca de idioma
4. Verifique que o texto não está cortado em ambos os idiomas
