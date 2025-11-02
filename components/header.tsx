import Link from "next/link";
import Image from "next/image";

export default function Header() {
    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="relative w-12 h-12">
                            <Image
                                src="/images/logo.jpg"
                                alt="Bohn Voyage Logo"
                                fill
                                className="object-contain rounded-full"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--secondary)] hidden sm:block">
                            Bohn Voyage
                        </h1>
                    </Link>
                    <nav className="flex gap-6 items-center">
                        <Link
                            href="/"
                            className="text-[var(--secondary)] font-semibold hover:text-[var(--primary)] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-[var(--primary)]/20"
                        >
                            Home
                        </Link>
                        <Link
                            href="/book"
                            className="bg-[var(--secondary)] text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md"
                        >
                            Book Now
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}