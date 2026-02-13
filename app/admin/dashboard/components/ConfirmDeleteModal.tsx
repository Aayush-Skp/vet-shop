"use client";

interface ConfirmDeleteModalProps {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
  /** Optional preview image URL */
  previewImage?: string;
  previewImageAlt?: string;
}

export default function ConfirmDeleteModal({
  title,
  message,
  onCancel,
  onConfirm,
  deleting,
  previewImage,
  previewImageAlt,
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          {previewImage && (
            <div className="mb-4">
              <img
                src={previewImage}
                alt={previewImageAlt || "Preview"}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
          <p
            className="text-sm text-gray-500 mb-6"
            dangerouslySetInnerHTML={{ __html: message }}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
