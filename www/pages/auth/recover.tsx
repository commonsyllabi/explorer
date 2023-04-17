import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";


const PasswordRecover: NextPage = () => {
    // Get token from URL params
    const router = useRouter()
    const token = router.query.token;

    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConf, setNewPasswordConf] = useState("");
    const [requestMade, setRequestMade] = useState(false);

    const [isCheckingPassword, setIsCheckingPassword] = useState(false);
    const [log, setLog] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePasswordChange = (e: React.BaseSyntheticEvent) => {
        const v = e.target.value as string;
        setNewPassword(v);
    };

    const handlePasswordConfChange = (e: React.BaseSyntheticEvent) => {
        const v = e.target.value as string;
        setNewPasswordConf(v);
    };

    const handleRecover = (e: React.BaseSyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (newPassword.length < 8) {
            setLog("Password must be at least 8 characters")
            return;
        }

        if (newPassword !== newPasswordConf) {
            setLog("Passwords must match!")
            return
        }

        let b = new FormData()
        b.append("password", newPassword)

        const url = new URL(`/auth/check-recover?token=${token}`, process.env.NEXT_PUBLIC_API_URL)
        fetch(url, { method: 'POST', body: b })
            .then(res => {
                if (res.ok) {
                    setLog("Success! You will be redirected in a few seconds")
                    setTimeout(() => {
                        router.push("/")
                    }, 3000)
                }
                else {
                    setLog("Something went wrong, please try again in a few seconds ")
                }
            })
    };

    const noToken = (
        <div>This is the password reset page, which you should trigger from the login page, or your user account.</div>
    );

    const recoveryForm = (
        <form
            className="w-full flex flex-col gap-4"
            onSubmit={handleRecover}
        >
            <div className="w-full">
                <h2 className="text-2xl">Email recovery</h2>
                <div className="flex flex-col gap-3 w-full">
                    <input
                        className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        type="password"
                    />
                    <input
                        className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                        onChange={handlePasswordConfChange}
                        placeholder="Confirm your new password"
                        type="password"
                    />
                </div>
            </div>

            <button
                className="w-full p-2 text-center bg-gray-900 text-gray-100 border-2 rounded-md"
                type="submit"
            >
                Change password
            </button>

        </form>
    );

    const requestStatus = (
        <div className="">
            {isSuccess === true ? (
                <div>
                    Your password was changed you can now{" "}
                    <Link className="underline" href="/auth">
                        login
                    </Link>
                </div>
            ) : (
                <p className="w-full mt-3 p-2 bg-amber-200">{log}</p>
            )}
        </div>
    );

    return (
        <div className="flex flex-col gap-5 w-11/12 md:w-4/12 m-auto mt-8">
            <div className="bg-slate-50 md:w-full text-slate-900 flex flex-col justify-center items-center">
                {!token ? (
                    noToken
                ) : (
                    !requestMade ? (
                        recoveryForm
                    ) : (
                        requestStatus
                    )
                )}
                <Link href="/" className="w-full text-center p-2 mt-8 bg-gray-200 border-2 rounded-md">Back to Cosyll</Link>
            </div>
        </div>
    );
};

export default PasswordRecover;