'use client';
import React, { useState, useEffect, useCallback } from 'react';

// Types
interface FormField {
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  type: string;
  name: string;
  placeholder: string;
  required: boolean;
  value: string;
}

interface DetectedForm {
  id: string;
  element: HTMLFormElement;
  fields: FormField[];
  name: string;
}

interface FormAutoFillProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  autoDetect?: boolean;
  customData?: Record<string, any>;
  useRandomData?: boolean;
  preventFormClear?: boolean;
  onFormFilled?: (formId: string) => void;
  onFormSubmit?: (formId: string, formData: FormData) => void;
}

// Random data generators
const randomFromArray = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)] as T;

const generateRandomEmail = (): string => {
  const firstNames = [
    'john',
    'jane',
    'alex',
    'sarah',
    'michael',
    'emily',
    'david',
    'lisa',
    'robert',
    'maria',
  ];
  const lastNames = [
    'smith',
    'johnson',
    'williams',
    'brown',
    'jones',
    'garcia',
    'miller',
    'davis',
    'rodriguez',
    'martinez',
  ];
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'email.com', 'example.com'];
  return `${randomFromArray(firstNames)}.${randomFromArray(lastNames)}${Math.floor(Math.random() * 999)}@${randomFromArray(domains)}`;
};

const generateRandomPhone = (): string => {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `+1 (${areaCode}) ${prefix}-${lineNumber}`;
};

const generateRandomName = (type: 'first' | 'last' | 'full'): string => {
  const firstNames = [
    'John',
    'Jane',
    'Alex',
    'Sarah',
    'Michael',
    'Emily',
    'David',
    'Lisa',
    'Robert',
    'Maria',
    'James',
    'Anna',
    'Chris',
    'Emma',
    'Daniel',
  ];
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
    'Wilson',
    'Anderson',
    'Taylor',
    'Thomas',
    'Moore',
  ];

  if (type === 'first') return randomFromArray(firstNames);
  if (type === 'last') return randomFromArray(lastNames);
  return `${randomFromArray(firstNames)} ${randomFromArray(lastNames)}`;
};

const generateRandomAddress = (): string => {
  const streetNames = [
    'Main',
    'Oak',
    'Pine',
    'Maple',
    'Cedar',
    'Elm',
    'Washington',
    'Lake',
    'Hill',
    'Park',
  ];
  const streetTypes = ['Street', 'Avenue', 'Boulevard', 'Drive', 'Lane', 'Road', 'Way'];
  const number = Math.floor(Math.random() * 9999) + 1;
  return `${number} ${randomFromArray(streetNames)} ${randomFromArray(streetTypes)}`;
};

const generateRandomCity = (): string => {
  const cities = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'Austin',
    'Seattle',
    'Denver',
    'Boston',
    'Miami',
    'Atlanta',
  ];
  return randomFromArray(cities);
};

const generateRandomState = (): string => {
  const states = [
    'CA',
    'TX',
    'FL',
    'NY',
    'PA',
    'IL',
    'OH',
    'GA',
    'NC',
    'MI',
    'WA',
    'CO',
    'MA',
    'AZ',
    'VA',
  ];
  return randomFromArray(states);
};

const generateRandomZip = (): string => {
  return String(Math.floor(Math.random() * 90000) + 10000);
};

const generateRandomCompany = (): string => {
  const prefixes = ['Tech', 'Global', 'Digital', 'Smart', 'Innovative', 'Creative', 'Dynamic'];
  const suffixes = ['Solutions', 'Systems', 'Industries', 'Corp', 'Inc', 'Group', 'Enterprises'];
  return `${randomFromArray(prefixes)} ${randomFromArray(suffixes)}`;
};

const generateRandomDate = (): string => {
  const year = Math.floor(Math.random() * 30) + 1990;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateRandomTime = (): string => {
  const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return `${hour}:${minute}`;
};

const generateRandomUrl = (): string => {
  const domains = ['example', 'mysite', 'demo', 'test', 'website'];
  const tlds = ['com', 'net', 'org', 'io', 'co'];
  return `https://www.${randomFromArray(domains)}.${randomFromArray(tlds)}`;
};

const generateRandomColor = (): string => {
  return (
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  );
};

const generateRandomNumber = (min: number = 1, max: number = 100): string => {
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const generateRandomText = (length: 'short' | 'medium' | 'long' = 'medium'): string => {
  const words = [
    'Lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
  ];
  const wordCounts = { short: 5, medium: 15, long: 30 };
  const count = wordCounts[length];
  const text = Array.from({ length: count }, () => randomFromArray(words)).join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
};

// Utility functions
const generateSampleData = (field: FormField, useRandom: boolean = false): any => {
  const type = field.type.toLowerCase();
  const name = field.name.toLowerCase();

  if (useRandom) {
    // Generate random data based on field context
    if (name.includes('email')) {
      return generateRandomEmail();
    } else if (name.includes('phone') || name.includes('mobile') || name.includes('tel')) {
      return generateRandomPhone();
    } else if (name.includes('first') && name.includes('name')) {
      return generateRandomName('first');
    } else if (name.includes('last') && name.includes('name')) {
      return generateRandomName('last');
    } else if (name.includes('name')) {
      return generateRandomName('full');
    } else if (name.includes('address')) {
      return generateRandomAddress();
    } else if (name.includes('city')) {
      return generateRandomCity();
    } else if (name.includes('zip') || name.includes('postal')) {
      return generateRandomZip();
    } else if (name.includes('country')) {
      return 'United States';
    } else if (name.includes('state')) {
      return generateRandomState();
    } else if (name.includes('company') || name.includes('organization')) {
      return generateRandomCompany();
    } else if (name.includes('age')) {
      return generateRandomNumber(18, 80);
    } else if (name.includes('website') || name.includes('url')) {
      return generateRandomUrl();
    }

    // Generate random data by input type
    switch (type) {
      case 'email':
        return generateRandomEmail();
      case 'tel':
        return generateRandomPhone();
      case 'number':
        return generateRandomNumber();
      case 'date':
        return generateRandomDate();
      case 'time':
        return generateRandomTime();
      case 'url':
        return generateRandomUrl();
      case 'color':
        return generateRandomColor();
      case 'range':
        return generateRandomNumber(0, 100);
      case 'checkbox':
        return Math.random() > 0.5;
      case 'radio':
        return field.element.value || 'option1';
      case 'select':
      case 'select-one':
        const selectElement = field.element as HTMLSelectElement;
        const options = Array.from(selectElement.querySelectorAll('option'));
        if (options.length > 1) {
          const randomOption = randomFromArray(options.slice(1));
          return randomOption.value;
        }
        return '';
      case 'textarea':
        return generateRandomText('long');
      default:
        return generateRandomText('short');
    }
  }

  // Static sample data (original behavior)
  if (name.includes('email')) {
    return 'john.doe@example.com';
  } else if (name.includes('phone') || name.includes('mobile') || name.includes('tel')) {
    return '+1 (555) 123-4567';
  } else if (name.includes('first') && name.includes('name')) {
    return 'John';
  } else if (name.includes('last') && name.includes('name')) {
    return 'Doe';
  } else if (name.includes('name')) {
    return 'John Doe';
  } else if (name.includes('address')) {
    return '123 Main Street';
  } else if (name.includes('city')) {
    return 'New York';
  } else if (name.includes('zip') || name.includes('postal')) {
    return '10001';
  } else if (name.includes('country')) {
    return 'United States';
  } else if (name.includes('state')) {
    return 'NY';
  } else if (name.includes('company') || name.includes('organization')) {
    return 'Acme Inc.';
  } else if (name.includes('age')) {
    return '30';
  } else if (name.includes('website') || name.includes('url')) {
    return 'https://example.com';
  }

  switch (type) {
    case 'email':
      return 'john.doe@example.com';
    case 'tel':
      return '+1 (555) 123-4567';
    case 'number':
      return '42';
    case 'date':
      return '2024-01-15';
    case 'time':
      return '14:30';
    case 'url':
      return 'https://example.com';
    case 'color':
      return '#3b82f6';
    case 'range':
      return '50';
    case 'checkbox':
      return true;
    case 'radio':
      return field.element.value || 'option1';
    case 'select':
    case 'select-one':
      const selectElement = field.element as HTMLSelectElement;
      const options = selectElement.querySelectorAll('option');
      return options.length > 1 ? options[1]?.value : '';
    case 'textarea':
      return 'This is sample text content for the textarea field.';
    default:
      return 'Sample Text';
  }
};

const fillField = (
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: any,
) => {
  const type = element.type ? element.type.toLowerCase() : element.tagName.toLowerCase();

  // For React compatibility, we need to:
  // 1. Set value using native setter (bypasses React's control)
  // 2. Trigger input event (React listens to this)
  // 3. Trigger change event (for non-React forms)
  // 4. Trigger blur event (ensures validation runs)

  const triggerReactChange = (elem: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
    // Get the native setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set;
    const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype,
      'value',
    )?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )?.set;

    // Determine which setter to use
    let setter;
    if (elem instanceof HTMLInputElement && nativeInputValueSetter) {
      setter = nativeInputValueSetter;
    } else if (elem instanceof HTMLSelectElement && nativeSelectValueSetter) {
      setter = nativeSelectValueSetter;
    } else if (elem instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
      setter = nativeTextAreaValueSetter;
    }

    // Set the value using native setter if available
    if (setter) {
      setter.call(elem, value);
    } else {
      elem.value = value;
    }

    // Trigger input event (React Hook Form and other libraries listen to this)
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    elem.dispatchEvent(inputEvent);

    // Trigger change event (for additional compatibility)
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    elem.dispatchEvent(changeEvent);

    // Trigger blur event (ensures validation runs in some form libraries)
    const blurEvent = new Event('blur', { bubbles: true, cancelable: true });
    elem.dispatchEvent(blurEvent);

    // Also trigger focus event sequence for better React compatibility
    elem.focus();
  };

  switch (type) {
    case 'checkbox':
      const nativeCheckboxSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'checked',
      )?.set;

      if (nativeCheckboxSetter) {
        nativeCheckboxSetter.call(element, Boolean(value));
      } else {
        (element as HTMLInputElement).checked = Boolean(value);
      }

      element.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      break;

    case 'radio':
      if ((element as HTMLInputElement).value === value) {
        const nativeRadioSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'checked',
        )?.set;

        if (nativeRadioSetter) {
          nativeRadioSetter.call(element, true);
        } else {
          (element as HTMLInputElement).checked = true;
        }

        element.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      }
      break;

    case 'select':
    case 'select-one':
    case 'select-multiple':
      triggerReactChange(element);
      break;

    default:
      triggerReactChange(element);
  }
};

const extractFormFields = (form: HTMLFormElement): FormField[] => {
  const fields: FormField[] = [];
  const inputs = form.querySelectorAll('input, select, textarea');

  inputs.forEach((input) => {
    const inputElement = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const inputType = inputElement.getAttribute('type');

    if (inputType === 'submit' || inputType === 'button' || inputType === 'hidden') {
      return;
    }

    const field: FormField = {
      element: inputElement,
      type: inputType || inputElement.tagName.toLowerCase(),
      name:
        inputElement.name ||
        inputElement.id ||
        (inputElement as HTMLInputElement).placeholder ||
        'Unknown',
      placeholder: (inputElement as HTMLInputElement).placeholder || '',
      required: inputElement.required,
      value: inputElement.value,
    };

    fields.push(field);
  });

  return fields;
};

const preventFormReset = (form: HTMLFormElement) => {
  // Prevent form from clearing on submit
  const handleSubmit = (e: Event) => {
    // Don't prevent default - let the form handle submission naturally
    // Just ensure values persist
    console.log('Form submitted with values:', new FormData(form));
  };

  // Only add listener if not already added
  if (!form.dataset['autoFillListenerAdded']) {
    form.addEventListener('submit', handleSubmit);
    form.dataset['autoFillListenerAdded'] = 'true';
  }
};

// Main Component
export const FormAutoFill: React.FC<FormAutoFillProps> = ({
  position = 'bottom-right',
  autoDetect = true,
  customData = {},
  useRandomData = false,
  preventFormClear = true,
  onFormFilled,
  onFormSubmit,
}) => {
  const [forms, setForms] = useState<DetectedForm[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [randomMode, setRandomMode] = useState(useRandomData);

  const detectForms = useCallback(() => {
    const formElements = document.querySelectorAll('form');
    const detectedForms: DetectedForm[] = [];

    formElements.forEach((form, index) => {
      const fields = extractFormFields(form);

      if (fields.length > 0) {
        detectedForms.push({
          id: `form-${index}`,
          element: form,
          fields: fields,
          name: form.name || form.id || `Form ${index + 1}`,
        });

        // Add submit handler to prevent clearing
        if (preventFormClear && form.dataset['autoFillListenerAdded'] !== 'true') {
          form.addEventListener('submit', (e) => {
            // Store form data before potential page reload
            const formData = new FormData(form);
            console.log('Form data captured:', Object.fromEntries(formData));

            if (onFormSubmit) {
              onFormSubmit(`form-${index}`, formData);
            }

            // If you want to prevent the actual submission (for testing)
            // Uncomment the line below:
            // e.preventDefault();
          });
          form.dataset['autoFillListenerAdded'] = 'true';
        }
      }
    });

    setForms(detectedForms);
  }, [preventFormClear, onFormSubmit]);

  const fillForm = useCallback(
    (formId: string) => {
      const form = forms.find((f) => f.id === formId);
      if (!form) return;

      form.fields.forEach((field) => {
        const customValue = customData[field.name];
        const value =
          customValue !== undefined ? customValue : generateSampleData(field, randomMode);
        fillField(field.element, value);
      });

      form.element.dispatchEvent(new Event('change', { bubbles: true }));

      if (onFormFilled) {
        onFormFilled(formId);
      }
    },
    [forms, customData, randomMode, onFormFilled],
  );

  useEffect(() => {
    detectForms();

    if (autoDetect) {
      const observer = new MutationObserver(() => {
        detectForms();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, [detectForms, autoDetect]);

  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
  };

  const panelPosition: Record<string, React.CSSProperties> = {
    'bottom-right': { bottom: '70px', right: '0' },
    'bottom-left': { bottom: '70px', left: '0' },
    'top-right': { top: '70px', right: '0' },
    'top-left': { top: '70px', left: '0' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: 10000,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => {
          setIsVisible(!isVisible);
          if (!isVisible) detectForms();
        }}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'transform 0.2s, background 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.background = '#2563eb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = '#3b82f6';
        }}
      >
        📋
      </button>

      {/* Panel */}
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            ...panelPosition[position],
            width: '350px',
            maxHeight: '500px',
            overflowY: 'auto',
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '2px solid #e5e7eb',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Forms Detected: {forms.length}
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#6b7280',
              }}
            >
              ×
            </button>
          </div>

          {/* Random Data Toggle */}
          <div
            style={{
              marginBottom: '15px',
              padding: '10px',
              background: '#f3f4f6',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>
              🎲 Random Data
            </span>
            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                width: '48px',
                height: '24px',
              }}
            >
              <input
                type="checkbox"
                checked={randomMode}
                onChange={(e) => setRandomMode(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: randomMode ? '#3b82f6' : '#cbd5e1',
                  transition: '0.4s',
                  borderRadius: '24px',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: '',
                    height: '18px',
                    width: '18px',
                    left: randomMode ? '26px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.4s',
                    borderRadius: '50%',
                  }}
                />
              </span>
            </label>
          </div>

          {/* Forms List */}
          {forms.length === 0 ? (
            <p style={{ color: '#6b7280', margin: 0 }}>No forms detected on this page.</p>
          ) : (
            forms.map((form) => (
              <div
                key={form.id}
                style={{
                  marginBottom: '15px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong style={{ color: '#111827', display: 'block', marginBottom: '4px' }}>
                      {form.name}
                    </strong>
                    <small style={{ color: '#6b7280' }}>{form.fields.length} fields</small>
                  </div>
                  <button
                    onClick={() => fillForm(form.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#2563eb')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#3b82f6')}
                  >
                    Fill Form
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Hook version for more control
export const useFormAutoFill = () => {
  const [forms, setForms] = useState<DetectedForm[]>([]);

  const detectForms = useCallback(() => {
    const formElements = document.querySelectorAll('form');
    const detectedForms: DetectedForm[] = [];

    formElements.forEach((form, index) => {
      const fields = extractFormFields(form);

      if (fields.length > 0) {
        detectedForms.push({
          id: `form-${index}`,
          element: form,
          fields: fields,
          name: form.name || form.id || `Form ${index + 1}`,
        });
      }
    });

    setForms(detectedForms);
    return detectedForms;
  }, []);

  const fillForm = useCallback(
    (formId: string, customData: Record<string, any> = {}) => {
      const form = forms.find((f) => f.id === formId);
      if (!form) return;

      form.fields.forEach((field) => {
        const customValue = customData[field.name];
        const value = customValue !== undefined ? customValue : generateSampleData(field, true);
        fillField(field.element, value);
      });

      form.element.dispatchEvent(new Event('change', { bubbles: true }));
    },
    [forms],
  );

  const fillAllForms = useCallback(
    (customData: Record<string, any> = {}) => {
      forms.forEach((form) => {
        fillForm(form.id, customData);
      });
    },
    [forms, fillForm],
  );

  return {
    forms,
    detectForms,
    fillForm,
    fillAllForms,
  };
};

export default FormAutoFill;
