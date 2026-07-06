import {Document} from "../types";

export default function DocumentGridView({ documents} : {documents:Document[]}) {
    if (documents.length === 0) { 
        return (
            <div className="text-center py-10 text-gray-500">
                No documents found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc) => (
                <div
                    key={doc.id}
                    className="bg-white rounded-lg shadow border p-4 hover:shadow-lg transition"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg truncate">
                            {doc.name}
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {doc.category}
                        </span>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                        <p>Author: {doc.uploadedBy}</p>
                        <p>
                            Created:{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                    </div>

                    <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                        View
                    </button>
                </div>
            ))}
        </div>
    );
}