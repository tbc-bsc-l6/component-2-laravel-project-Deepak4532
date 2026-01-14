export default function FormButtons({ onCancel, submitText, isLoading, cancelText = 'Cancel', disabled = false }) {
    return (
        <div className="flex gap-2 justify-end pt-4">
            <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
                {cancelText}
            </button>
            <button
                type="submit"
                disabled={isLoading || disabled}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
                {isLoading ? `${submitText}...` : submitText}
            </button>
        </div>
    );
}
