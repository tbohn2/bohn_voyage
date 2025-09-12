import Link from "next/link";

export default function Header() {
    return (
        <div>
            <h1>Header</h1>
            <Link href="/">Home</Link>
            <Link href="/book">Book</Link>
        </div>
    );
}