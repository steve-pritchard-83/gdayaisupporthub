'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Priority, Category, Ticket } from '@/types';
import { saveTicket, generateId } from '@/utils/localStorage';

interface FormData {
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  email: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  email?: string;
}

export default function CreateTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Bug Report',
    email: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  // 🔧 BASIC VALIDATION - Keep it simple but effective
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create new ticket
      const newTicket: Ticket = {
        id: generateId(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        category: formData.category,
        email: formData.email.trim(),
        status: 'Open',
        createdDate: new Date().toISOString(),
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const success = saveTicket(newTicket);
        if (success) {
          setSubmitSuccess(true);
          // Reset form
          setFormData({
            title: '',
            description: '',
            priority: 'Medium',
            category: 'Bug Report',
            email: '',
          });
          
          // Redirect after short delay
          setTimeout(() => {
            router.push('/tickets');
          }, 2000);
        } else {
          throw new Error('Failed to save ticket');
        }
      }
    } catch (error) {
      setSubmitError('Failed to submit ticket. Please try again.');
      console.error('Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Success state
  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16 fade-in">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-6">
            Ticket Submitted Successfully!
          </h1>
          <p className="text-secondary mb-8 leading-relaxed">
            Your bug ticket or feature request has been submitted and will be reviewed by our team. You'll be redirected to the tickets page shortly.
          </p>
          <Link href="/tickets" className="btn-primary">
            View All Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/"
          className="inline-flex items-center text-secondary hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-bold text-primary mb-4">Create a New Ticket</h1>
        <p className="text-secondary text-lg leading-relaxed">
          Submit a bug ticket, feature request, or AI tool access request to help improve our platform.
        </p>
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="alert-attention-dark mb-8">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-accent mr-3" />
            <span className="text-primary">{submitError}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-8">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-secondary mb-3">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`form-input ${
              errors.title ? 'border-red-500' : ''
            }`}
            placeholder="Brief description of the bug or feature..."
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-2 text-sm text-accent bg-dark-surface-light px-3 py-2 rounded-lg">{errors.title}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary mb-3">
            Your G'day Group Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`form-input ${
              errors.email ? 'border-red-500' : ''
            }`}
            placeholder="steve.pritchard@gdaygroup.com.au"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-accent bg-dark-surface-light px-3 py-2 rounded-lg">{errors.email}</p>
          )}
          <p className="mt-2 text-sm text-muted">
            We'll use this to contact you on Teams about your ticket
          </p>
        </div>

        {/* Category Field */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-secondary mb-3">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value as Category)}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="Bug Ticket">Bug Ticket</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Access Request">Access Request</option>
            <option value="General Support">General Support</option>
          </select>
        </div>

        {/* Priority Field */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-secondary mb-3">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-secondary mb-3">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={6}
            className={`form-textarea ${
              errors.description ? 'border-red-500' : ''
            }`}
            placeholder="Please provide detailed information about the bug you found or the feature you'd like to request..."
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-2 text-sm text-accent bg-dark-surface-light px-3 py-2 rounded-lg">{errors.description}</p>
          )}
          <p className="mt-2 text-sm text-muted">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4">
          <Link href="/" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-12 alert-attention-dark">
        <h3 className="text-lg font-semibold text-accent mb-4">�� Tips for effective tickets:</h3>
        <ul className="text-secondary space-y-2">
          <li><strong>Be Specific:</strong> Provide a clear, concise title.</li>
          <li><strong>Steps to Reproduce:</strong> For bugs, list the exact steps to trigger the issue.</li>
          <li><strong>Expected vs. Actual:</strong> Clearly describe what you expected to happen and what actually happened.</li>
          <li><strong>Context is Key:</strong> Mention the AI tool, browser, or any relevant details.</li>
          <li><strong>One Issue Per Ticket:</strong> Submit separate tickets for unrelated issues to ensure faster processing.</li>
        </ul>
      </div>
    </div>
  );
} 