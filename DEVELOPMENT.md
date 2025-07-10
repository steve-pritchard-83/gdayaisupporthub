# 🚀 Development Guide - Vibe Coding Enhanced

## Quick Start for Rapid Development

This project has been enhanced with powerful tools for **vibe coding** - rapid prototyping and iteration. Here's how to use them effectively:

### 🛠️ Enhanced Development Tools

#### **Global Dev Tools (Available in Browser Console)**
```javascript
// Available as window.gdayaiDevTools in development
gdayaiDevTools.storage.inspect()      // View all app data
gdayaiDevTools.storage.clear()        // Reset all data
gdayaiDevTools.storage.export()       // Download data as JSON
gdayaiDevTools.features.set('newUI', true)  // Feature flags
```

#### **Performance Monitoring**
```typescript
import { perf, logger } from './src/utils/devTools';

// Time functions
const result = perf.time('expensive-operation', () => {
  // Your code here
});

// Async operations
const data = await perf.timeAsync('api-call', async () => {
  return await fetchData();
});
```

#### **Component Debugging**
```typescript
import { componentDebug } from './src/utils/devTools';

const MyComponent = (props) => {
  componentDebug.logRender('MyComponent', props);
  
  useEffect(() => {
    componentDebug.logEffect('MyComponent', 'data-fetch', [dependency]);
  }, [dependency]);
};
```

### 🎨 Styling System

#### **CSS Variables for Easy Theming**
```css
/* Update colors instantly */
:root {
  --color-primary: #your-brand-color;
  --color-success: #your-success-color;
}

/* Use utility classes */
.my-component {
  background: var(--bg-card);
  color: var(--text-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}
```

#### **Utility Classes Available**
```html
<div class="flex items-center gap-3 bg-card shadow-md">
  <span class="text-primary">Content</span>
</div>
```

### 📋 Constants & Configuration

#### **Centralized Configuration**
```typescript
import { TICKET_CONFIG, UI_CONFIG, ERROR_MESSAGES } from './src/utils/constants';

// Use constants instead of magic strings
const maxLength = TICKET_CONFIG.max_title_length;
const errorMsg = ERROR_MESSAGES.required_field;
```

#### **Type-Safe Enums**
```typescript
import { TICKET_CONFIG } from './src/utils/constants';

// Auto-completion and type safety
type TicketStatus = typeof TICKET_CONFIG.statuses[number];
```

### 🔧 Utility Functions

#### **Date & Text Formatting**
```typescript
import { formatDate, truncateText, formatStatus } from './src/utils/formatters';

const displayDate = formatDate(ticket.createdAt);
const shortDesc = truncateText(ticket.description, 100);
const statusText = formatStatus('in-progress'); // "In Progress"
```

#### **Custom Hooks**
```typescript
import { useArchivedTickets } from './src/hooks/useArchivedTickets';

const MyComponent = () => {
  const { archivedTickets, isLoading, loadArchivedTickets } = useArchivedTickets();
  
  // No more duplicate state management!
};
```

### 📦 Enhanced Scripts

#### **Development Commands**
```bash
# Standard development
npm run dev

# Type checking only
npm run type-check

# Lint and fix issues
npm run lint:fix

# Check everything
npm run check

# Bundle analysis
npm run build:analyze

# Reset everything
npm run reset
```

## 🎯 Best Practices for Vibe Coding

### **1. Use the Constants**
```typescript
// ❌ Don't do this
if (ticket.status === 'in-progress') { }

// ✅ Do this
import { TICKET_CONFIG } from './utils/constants';
if (ticket.status === 'in-progress') { } // Type-safe!
```

### **2. Leverage Utility Functions**
```typescript
// ❌ Don't repeat formatting logic
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

// ✅ Use the formatter
import { formatDate } from './utils/formatters';
const displayDate = formatDate(ticket.createdAt);
```

### **3. Use CSS Variables for Rapid Theming**
```css
/* ❌ Don't hardcode colors */
.button {
  background-color: #3b82f6;
}

/* ✅ Use variables for easy changes */
.button {
  background-color: var(--color-primary);
}
```

### **4. Take Advantage of Dev Tools**
```typescript
// Debug localStorage easily
gdayaiDevTools.storage.inspect();

// Test features quickly
gdayaiDevTools.features.set('darkMode', true);

// Monitor performance
const data = perf.time('data-processing', () => processData());
```

### **5. Use Custom Hooks**
```typescript
// ❌ Don't duplicate state logic
const [archivedTickets, setArchivedTickets] = useState([]);
const [isLoading, setIsLoading] = useState(false);
// ... repeated in multiple components

// ✅ Use the custom hook
const { archivedTickets, isLoading, loadArchivedTickets } = useArchivedTickets();
```

## 🚀 Rapid Prototyping Tips

1. **Feature Flags**: Test new features without affecting production
2. **CSS Variables**: Change themes in real-time
3. **Dev Tools**: Debug state and performance instantly
4. **Constants**: Add new configurations easily
5. **Utilities**: Reuse common patterns

## 🔧 Customization Examples

### **Add a New Theme**
```css
:root {
  --color-primary: #your-brand;
  --bg-primary: #your-bg;
  --text-primary: #your-text;
}
```

### **Add a New Ticket Status**
```typescript
// In constants.ts
export const TICKET_CONFIG = {
  statuses: ['pending', 'in-progress', 'completed', 'closed', 'on-hold'] as const,
  // ...
} as const;
```

### **Add a New Utility Function**
```typescript
// In formatters.ts
export const formatPhoneNumber = (phone: string): string => {
  // Your formatting logic
};
```

This setup makes your codebase **perfect for vibe coding** - rapid iteration, easy customization, and powerful debugging tools! 