'use client';

import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Category, Provider, Procedure } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PhotoUpload } from './PhotoUpload';
import { cn } from '@/lib/utils';

interface QuoteFormProps {
  providers: Provider[];
  procedures: Procedure[];
  preselectedProviderId?: string;
}

interface FormErrors {
  provider?: string;
  procedure?: string;
  description?: string;
  photo?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface FormData {
  provider: string;
  procedure: string;
  description: string;
  photo: File | null;
  name: string;
  email: string;
  phone: string;
}

export function QuoteForm({
  providers,
  procedures,
  preselectedProviderId,
}: QuoteFormProps) {
  const [formData, setFormData] = useState<FormData>({
    provider: preselectedProviderId || '',
    procedure: '',
    description: '',
    photo: null,
    name: '',
    email: '',
    phone: '',
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const selectedProvider = providers.find((p) => p.id === formData.provider);
  const filteredProcedures =
    selectedProvider && selectedProvider.category_id
      ? procedures.filter((p) => p.category_id === selectedProvider.category_id)
      : [];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.provider.trim()) {
      newErrors.provider = 'Please select a provider';
    }
    if (!formData.procedure.trim()) {
      newErrors.procedure = 'Please select a procedure';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must not exceed 2000 characters';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhotoSelect = useCallback((file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, photo: file }));
    } else {
      setPreview(null);
      setFormData((prev) => ({ ...prev, photo: null }));
    }
    if (errors.photo) {
      setErrors((prev) => ({ ...prev, photo: undefined }));
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('provider_id', formData.provider);
      formDataToSend.append('procedure_id', formData.procedure);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);

      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit quote request');
      }

      setSubmitStatus({
        type: 'success',
        message: `Quote request submitted successfully! Check your email for updates. Quote ID: ${data.id}`,
      });

      // Reset form
      setFormData({
        provider: preselectedProviderId || '',
        procedure: '',
        description: '',
        photo: null,
        name: '',
        email: '',
        phone: '',
      });
      setPreview(null);

      // Scroll to success message
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while submitting your quote request',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {submitStatus && (
        <div
          className={cn(
            'mb-6 p-4 rounded-lg border flex gap-3',
            submitStatus.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          )}
        >
          {submitStatus.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={cn(
              'text-sm',
              submitStatus.type === 'success'
                ? 'text-green-800'
                : 'text-red-800'
            )}
          >
            {submitStatus.message}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label
            htmlFor="provider"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            Provider <span className="text-red-500">*</span>
          </label>
          <select
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleInputChange}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              errors.provider
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-neutral-300 focus:border-brand-blue focus:ring-brand-blue'
            )}
          >
            <option value="">Select a provider...</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name} {provider.verified ? '✓' : ''}
              </option>
            ))}
          </select>
          {errors.provider && (
            <p className="text-xs text-red-600 mt-1">{errors.provider}</p>
          )}
        </div>

        {/* Procedure Selection */}
        <div>
          <label
            htmlFor="procedure"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            Procedure <span className="text-red-500">*</span>
          </label>
          <select
            id="procedure"
            name="procedure"
            value={formData.procedure}
            onChange={handleInputChange}
            disabled={!formData.provider}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              !formData.provider ? 'bg-neutral-50 opacity-50 cursor-not-allowed' : '',
              errors.procedure
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-neutral-300 focus:border-brand-blue focus:ring-brand-blue'
            )}
          >
            <option value="">
              {!formData.provider
                ? 'Select a provider first'
                : 'Select a procedure...'}
            </option>
            {filteredProcedures.map((procedure) => (
              <option key={procedure.id} value={procedure.id}>
                {procedure.name}
              </option>
            ))}
          </select>
          {errors.procedure && (
            <p className="text-xs text-red-600 mt-1">{errors.procedure}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your needs in detail (minimum 50 characters)..."
            rows={5}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'placeholder:text-neutral-400 resize-none',
              errors.description
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-neutral-300 focus:border-brand-blue focus:ring-brand-blue'
            )}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-neutral-500">
              {formData.description.length > 0 && (
                <span>
                  {formData.description.length} / 2000 characters
                </span>
              )}
            </p>
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        <PhotoUpload onFileSelect={handlePhotoSelect} preview={preview} />

        {/* Name */}
        <Input
          id="name"
          type="text"
          name="name"
          label="Full Name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="John Doe"
          error={!!errors.name}
          errorMessage={errors.name}
          required
        />

        {/* Email */}
        <Input
          id="email"
          type="email"
          name="email"
          label="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="john@example.com"
          error={!!errors.email}
          errorMessage={errors.email}
          required
        />

        {/* Phone */}
        <Input
          id="phone"
          type="tel"
          name="phone"
          label="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+1 (555) 123-4567"
          error={!!errors.phone}
          errorMessage={errors.phone}
          required
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          className="w-full"
        >
          Request Quote
        </Button>

        <p className="text-xs text-neutral-500 text-center">
          We'll send your request to the provider and notify you when they respond.
        </p>
      </form>
    </div>
  );
}
