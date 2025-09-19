import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function CustomerLogin() {
    const router = useRouter();
    const [token, setToken] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        if (router.isReady && router.query.token) {
            setToken(router.query.token as string);
        }
    }, [router.isReady, router.query.token]);

    useEffect(() => {
        if (token.length > 0) {
            authCustomer();
        }
    }, [token]);

    const authCustomer = async () => {
        setIsLoading(true);
        setMessage("");

        try {
            const apiUrl = process.env.API_URL;
            const response = await fetch(`${apiUrl}/customer-login/?token=${token}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                setMessage("Email verification successful! Return to booking tab to continue.");
            } else {
                setMessage(data.message || "Invalid token. Please try again.");
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen p-4 bg-gray-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-indigo-900 mb-6">
                    Customer Login
                </h1>

                {isLoading && (
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">
                            Verifying customer...
                        </p>
                    </div>
                )}

                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-center ${message.includes("successful")
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
