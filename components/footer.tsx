import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-secondary text-white mt-auto z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div className="flex flex-col items-center md:items-start">
                        <Link href="/" className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/images/logo.jpg"
                                    alt="Bohn Voyage Logo"
                                    fill
                                    className="object-contain rounded-full"
                                />
                            </div>
                            <h2 className="text-xl font-bold">Bohn Voyage</h2>
                        </Link>
                        <p className="text-white/80 text-sm text-center md:text-left">
                            Experience the serenity of floating down our beautiful river on premium tubes.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <nav className="flex flex-col gap-2">
                            <Link
                                href="/"
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                href="/book"
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                Book Your Float
                            </Link>
                        </nav>
                    </div>

                    {/* Contact Section */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <div className="flex flex-col gap-3">
                            <a
                                href="mailto:bohnvoyageaz@gmail.com"
                                className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                bohnvoyageaz@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/20 mt-8 pt-6 text-center">
                    <p className="text-white/60 text-sm">
                        © {new Date().getFullYear()} Bohn Voyage. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}