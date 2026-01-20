interface FieldInputProps {
    label: string;
    type: 'text' | 'email' | 'number' | 'textarea';
    value: string | number;
    onChange: (value: string | number) => void;
    required?: boolean;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    helpText?: string;
}

export function FieldInput({
    label,
    type,
    value,
    onChange,
    required = false,
    placeholder,
    error,
    disabled = false,
    helpText,
}: FieldInputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
        onChange(newValue);
    };

    const inputClasses = `input-field ${error ? 'border-red-500 focus:ring-red-500' : ''} ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`;

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    rows={4}
                    className={inputClasses}
                    disabled={disabled}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    className={inputClasses}
                    disabled={disabled}
                />
            )}

            {helpText && (
                <p className="mt-1 text-xs text-gray-500">{helpText}</p>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
