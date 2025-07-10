// Constants for the application - centralized configuration

export const APP_CONFIG = {
  name: "G'day AI Support Hub",
  version: "1.0.0",
  author: "G'day AI",
  repository: "https://github.com/steve-pritchard-83/gdayaisupporthub",
  demo_url: "https://steve-pritchard-83.github.io/gdayaisupporthub/"
} as const;

export const LOCAL_STORAGE_KEYS = {
  tickets: 'gdayai_tickets',
  articles: 'gdayai_articles',
  comments: 'gdayai_comments',
  user_preferences: 'gdayai_user_prefs',
  admin_settings: 'gdayai_admin_settings'
} as const;

export const TICKET_CONFIG = {
  types: ['bug', 'feature'] as const,
  statuses: ['pending', 'in-progress', 'completed', 'closed'] as const,
  priorities: ['low', 'medium', 'high'] as const,
  max_description_length: 1000,
  max_title_length: 100,
  max_comment_length: 500
} as const;

export const ARTICLE_CONFIG = {
  categories: [
    'Getting Started',
    'Advanced',
    'Troubleshooting',
    'FAQ',
    'Tutorials',
    'Reference'
  ] as const,
  max_content_length: 10000,
  max_title_length: 200,
  max_tags: 10
} as const;

export const UI_CONFIG = {
  animation_duration: {
    fast: 150,
    normal: 250,
    slow: 350
  },
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280
  },
  pagination: {
    default_page_size: 10,
    max_page_size: 50
  },
  search: {
    min_query_length: 2,
    debounce_delay: 300
  }
} as const;

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  name: {
    min_length: 2,
    max_length: 50
  },
  password: {
    min_length: 8,
    max_length: 128
  }
} as const;

export const ERROR_MESSAGES = {
  required_field: 'This field is required',
  invalid_email: 'Please enter a valid email address',
  invalid_name: 'Name must be between 2 and 50 characters',
  network_error: 'Network error. Please try again.',
  storage_error: 'Failed to save data. Please try again.',
  not_found: 'Item not found',
  permission_denied: 'You do not have permission to perform this action'
} as const;

export const SUCCESS_MESSAGES = {
  ticket_created: 'Ticket created successfully!',
  ticket_updated: 'Ticket updated successfully!',
  ticket_archived: 'Ticket archived successfully!',
  ticket_restored: 'Ticket restored successfully!',
  comment_added: 'Comment added successfully!',
  article_created: 'Article created successfully!',
  article_updated: 'Article updated successfully!',
  article_deleted: 'Article deleted successfully!'
} as const;

export const CSS_CLASSES = {
  // Status classes
  status: {
    pending: 'tag-pending',
    'in-progress': 'tag-in-progress',
    completed: 'tag-completed',
    closed: 'tag-closed'
  },
  // Type classes
  type: {
    bug: 'tag-bug',
    feature: 'tag-feature'
  },
  // Priority classes
  priority: {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high'
  }
} as const;

export const DEFAULT_VALUES = {
  ticket: {
    status: 'pending' as const,
    priority: 'medium' as const,
    type: 'bug' as const
  },
  article: {
    category: 'Getting Started' as const,
    views: 0
  },
  pagination: {
    page: 1,
    size: 10
  }
} as const;

// Development and debugging
export const DEBUG = {
  enabled: import.meta.env.DEV,
  log_level: import.meta.env.DEV ? 'debug' : 'error',
  performance_monitoring: import.meta.env.DEV
} as const; 