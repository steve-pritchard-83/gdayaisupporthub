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
}

interface FormErrors {
  title?: string;
  description?: string;
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
    category: 'General Support',
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
        status: 'Open',
        createdDate: new Date().toISOString(),
      };
      
      // Save to localStorage
      const success = saveTicket(newTicket);
      
      if (success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          title: '',
          description: '',
          priority: 'Medium',
          category: 'General Support',
        });
        
        // Redirect after short delay
        setTimeout(() => {
          router.push('/tickets');
        }, 2000);
      } else {
        throw new Error('Failed to save ticket');
      }
    } catch (error) {
      setSubmitError('Failed to create ticket. Please try again.');
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
        <div className="text-center py-12">
                                 <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
         <CheckCircle className="w-8 h-8 text-white" />
        </div>
          <h1 className="text-2xl font-bold text-grey-900 mb-4">
            Ticket Created Successfully!
          </h1>
          <p className="text-grey-600 mb-8">
            Your support ticket has been created and assigned. You'll be redirected to the tickets page shortly.
          </p>
          <Link href="/tickets" className="btn-primary">
            View All Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-grey-600 hover:text-grey-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-grey-900">Create New Ticket</h1>
        <p className="text-grey-600 mt-2">
          Submit a new support request for AI tool access or technical assistance.
        </p>
      </div>

      {/* Error Alert */}
      {submitError && (
                             <div className="bg-accent border border-accent-dark rounded-lg p-4 mb-6">
          <div className="flex items-center">
           <AlertCircle className="w-5 h-5 text-white mr-2" />
           <span className="text-black">{submitError}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-grey-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus-ring ${
              errors.title ? 'border-red-300' : 'border-grey-300'
            }`}
            placeholder="Brief description of your issue..."
            disabled={isSubmitting}
          />
          {errors.title && (
                         <p className="mt-1 text-sm text-black bg-accent px-2 py-1 rounded">{errors.title}</p>
          )}
        </div>

        {/* Category Field */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-grey-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value as Category)}
            className="w-full px-3 py-2 border border-grey-300 rounded-lg focus-ring"
            disabled={isSubmitting}
          >
            <option value="Access Request">Access Request</option>
            <option value="Technical Issue">Technical Issue</option>
            <option value="General Support">General Support</option>
          </select>
        </div>

        {/* Priority Field */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-grey-700 mb-2">
            Priority
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
            className="w-full px-3 py-2 border border-grey-300 rounded-lg focus-ring"
            disabled={isSubmitting}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-grey-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus-ring resize-none ${
              errors.description ? 'border-red-300' : 'border-grey-300'
            }`}
            placeholder="Please provide detailed information about your request or issue..."
            disabled={isSubmitting}
          />
          {errors.description && (
                         <p className="mt-1 text-sm text-black bg-accent px-2 py-1 rounded">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-grey-500">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-grey-900 mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Create Ticket
              </>
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
             <div className="mt-8 p-4 bg-accent rounded-lg">
         <h3 className="text-sm font-medium text-black mb-2">💡 Tips for better support:</h3>
         <ul className="text-sm text-black space-y-1">
          <li>• Be specific about which AI tool you need access to</li>
          <li>• Include error messages if you're reporting a technical issue</li>
          <li>• Mention your business justification for access requests</li>
          <li>• Check the Knowledge Base first for common questions</li>
        </ul>
      </div>
    </div>
  );
} 