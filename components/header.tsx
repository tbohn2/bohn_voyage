import Link from "next/link";

export default function Header() {
    return (
        <div className="flex justify-between items-center p-4">
            <h1>Header</h1>
            <div className="flex gap-4">
                <Link href="/">Home</Link>
                <Link href="/book">Book</Link>
            </div>
        </div>
    );
}