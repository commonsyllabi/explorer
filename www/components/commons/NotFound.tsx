import * as React from "react";
import Link from "next/link"

const NotFound: React.FunctionComponent = (props) => {
    return (
        <div className="flex justify-center mt-8">
            <div className="pt-3 pb-5 flex flex-col gap-3">
                <h1 className="text-2xl font-bold">Sorry!</h1>
                <div>We couldn&apos;t find what you were looking for.</div>
                <div>
                    Go back to the <Link href="/" className="underline">main page</Link>.
                </div>
            </div>
        </div>
    );
};

export default NotFound;