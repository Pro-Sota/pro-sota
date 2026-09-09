export default function RemoveMemberDialog() {
    return ( <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
        onClick={() => {
            if (!isRemoving) {
                setMemberToRemove(null);
            }
        }}
    >
        <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Remover membro
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                    Tem a certeza de que deseja remover este membro
                    do projecto?
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                    Esta ação irá remover o membro da equipa deste
                    projecto.
                </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                    type="button"
                    disabled={isRemoving}
                    onClick={() => setMemberToRemove(null)}
                    className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    disabled={isRemoving}
                    onClick={confirmRemoveMember}
                    className="cursor-pointer rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isRemoving ? "A remover..." : "Remover membro"}
                </button>
            </div>
        </div>
    </div>);
}