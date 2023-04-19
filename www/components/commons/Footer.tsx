import Link from "next/link";

const Footer: React.FunctionComponent = () => {

    return (<div id="footer" className="fixed inset-x-0 w-full bottom-0 h-5 border border-t-black bg-white flex justify-between items-center p-4">
        <div>
            Common Syllabi - 2023
        </div>
        <div className="flex gap-2 underline">
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms-of-use">Terms of use</Link>
        </div>
    </div>)
}

export default Footer;