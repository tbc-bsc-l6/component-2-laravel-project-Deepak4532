export default function FormMessages({ error, success }) {
    return (
        <>
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                    {success}
                </div>
            )}
        </>
    );
}
