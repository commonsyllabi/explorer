import type { NextPage } from "next";
import React, { useState } from "react";

import { useSession, signIn, signOut } from "next-auth/react";
import Router from "next/router";
import Link from "next/link";
import UserPassword from "components/User/UserPassword";
import Modal from "components/commons/Modal";

const SignIn: NextPage = () => {
  const { data: session, status } = useSession();

  const url = new URL("users/", process.env.NEXT_PUBLIC_API_URL);
  const [activeTab, setActiveTab] = useState("Login")
  const [log, setLog] = useState("");
  const [error, setError] = useState("");
  const [isCreated, setCreated] = useState(false);
  const [isShowingRecovery, setShowingRecovery] = useState(false)

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupEmailConf, setSignupEmailConf] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordConf, setSignupPasswordConf] = useState("");

  const [isNewsletterAgreement, setNewsletterAgreement] = useState(false)
  const [isTermsAgreement, setTermsAgreement] = useState(false)

  const handleLogin = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const validateEmail = (_e: string) => {
      return String(_e)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    if (!validateEmail(loginEmail)) {
      setLog("The email does not seem to be valid.")
      return
    }

    if (loginPassword.length < 8) {
      setLog("The password should be at least 8 characters long.")
      return;
    }

    setLog('')
    setError('')

    signIn("credentials", {
      username: loginEmail,
      password: loginPassword,
      redirect: false
    }).
      then(res => {
        if (!res || res.error) setError("There was an error during login. Please check your email and password.")
        else
          if (res.ok) Router.push("/")
      })
  }

  const handleSignup = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isTermsAgreement) {
      setLog("You must agree to the terms of use and privacy policy to use this platform.")
      return;
    }

    if (signupEmail !== signupEmailConf) {
      setLog("Emails should match!");
      return;
    }

    if (signupPassword !== signupPasswordConf) {
      setLog("Passwords should match!");
      return;
    }

    if (signupPassword.length < 8) {
      setLog("Password should be at least 8 characters");
      return;
    }

    if (signupName === "") {
      setLog("Name cannot be empty");
      return;
    }

    setLog("")
    setError("")

    const h = new Headers();
    h.append("Content-Type", "application/x-www-form-urlencoded");

    const b = new URLSearchParams();
    b.append("name", signupName);
    b.append("email", signupEmail);
    b.append("password", signupPassword);
    if (isNewsletterAgreement)
      b.append("is_newsletter_subscribed", "true")

    fetch(url.href, {
      method: "POST",
      headers: h,
      body: b,
    })
      .then((res) => {
        if (res.status == 201) setCreated(true);
        else return res.text();
      })
      .then((body) => {
        setError(body as string);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleLoginUsername = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setLoginEmail(v);
  };

  const handleLoginPassword = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setLoginPassword(v);
  };

  const handleSignupName = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setSignupName(v);
  };

  const handleSignupEmail = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setSignupEmail(v);
  };

  const handleSignupEmailConf = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setSignupEmailConf(v);
  };

  const handleSignupPassword = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setSignupPassword(v);
  };

  const handleSignupPasswordConf = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setSignupPasswordConf(v);
  };

  const handleNewsletterAgreement = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value;
    setNewsletterAgreement(v);
  }

  const handleTermsAgreement = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value;
    setTermsAgreement(v);
  }

  //if already signed in, render user info
  if (status === "authenticated") {
    return (
      <div className="w-11/12 md:w-6/12 m-auto mt-5">
        <h1 className="h3 mb-3">
          You are logged in as{" "}
          <Link href={`/user/${session.user._id}`}>
            {session.user.name}
          </Link>
          .
        </h1>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="mt-4 p-2 bg-gray-900 text-gray-100 border-2 rounded-md">
          {" "}
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="w-11/12 md:w-6/12 m-auto mt-5">
      {!isCreated ? (
        <div>
          <div className="flex my-8">
            <div data-cy="signin-tab" onClick={() => setActiveTab("Login")} className={`text-xl mr-6 cursor-pointer ${activeTab === "Login" ? "font-bold" : ""}`}>Login</div>
            <div data-cy="signup-tab" onClick={() => setActiveTab("Sign up")} className={`text-xl mr-6 cursor-pointer ${activeTab === "Sign up" ? "font-bold" : ""}`}>Sign up</div>
          </div>
          <div id="tab">
            {activeTab === "Login" ?
              <div className="flex" title="Login">
                <form className="w-full mt-2" onSubmit={handleLogin}>
                  <div className="flex flex-col mb-3">
                    <label htmlFor="username">Email address</label>
                    <input
                      className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                      required
                      name="username"
                      type="email"
                      placeholder="Enter email"
                      data-cy="signin-button-email"
                      onChange={handleLoginUsername}
                    />
                    <div className="text-sm">
                      We&#39;ll never share your email with anyone else.
                    </div>
                  </div>

                  <div
                    className="mb-3 flex flex-col "
                  >
                    <label htmlFor="password">Password</label>
                    <input
                      className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                      required
                      name="password"
                      type="password"
                      placeholder="Password"
                      data-cy="signin-button-password"
                      onChange={handleLoginPassword}
                    />
                  </div>

                  <div className="flex justify-between items-baseline">

                    <button
                      type="submit"
                      className="mt-4 p-2 bg-gray-900 text-gray-100 border-2 rounded-md"
                      data-cy="signin-button-submit"
                    >
                      Login
                    </button>

                    <button type="button" className="underline cursor" onClick={() => setShowingRecovery(!isShowingRecovery)}>
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </div>
              :
              <div className="flex" title="Sign up" data-cy="Sign up">
                <form className="w-full flex flex-col gap-10 mt-2">
                  <div className="flex flex-col">
                    <label htmlFor="name">Name</label>
                    <input
                      className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                      type="text"
                      name="name"
                      placeholder="e.g. Max Li"
                      data-cy="Signup-name"
                      onChange={handleSignupName}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label htmlFor="signup-email">Email address</label>
                      <input
                        className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                        type="email"
                        name="signup-email"
                        placeholder="e.g. you@email.com"
                        data-cy="Signup-email"
                        onChange={handleSignupEmail}
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-email-conf">Confirm email address</label>
                      <input
                        className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                        type="email"
                        name="signup-email-conf"
                        placeholder="e.g. you@email.com"
                        data-cy="Signup-email-conf"
                        onChange={handleSignupEmailConf}
                      />
                      <div className="text-sm">
                        We&#39;ll never share your email with anyone else.
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label htmlFor="signup-password">Password</label>
                      <input
                        className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                        type="password"
                        name="signup-password"
                        placeholder="●●●●●●●"
                        data-cy="Signup-password"
                        onChange={handleSignupPassword}
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-password-conf">Confirm password</label>
                      <input
                        className="w-full bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
                        type="password"
                        name="signup-password-conf"
                        placeholder="●●●●●●●"
                        data-cy="Signup-password-conf"
                        onChange={handleSignupPasswordConf}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <label htmlFor="status" className="order-2" data-cy="courseStatusLabel">
                        I would like to subscribe to the newsletter.
                      </label>
                      <div className="relative border-2 w-6 h-6 border-gray-900 p-0.5 order-1 rounded-full">
                        <input
                          type="checkbox"
                          role="switch"
                          className="absolute w-4 h-4 appearance-none bg-gray-300 checked:bg-gray-900 cursor-pointer rounded-full"
                          onChange={handleNewsletterAgreement}
                          name="status"
                          id="status"
                          data-cy="newsletter-toggle" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label htmlFor="status" className="order-2" data-cy="courseStatusLabel">
                        I agree to the <Link target="_blank" className="underline" href="/terms-of-use">terms of use</Link> and to our <Link target="_blank" className="underline" href="/privacy-policy">privacy policy</Link>.
                      </label>
                      <div className="relative border-2 w-6 h-6 border-gray-900 p-0.5 order-1 rounded-full">
                        <input
                          type="checkbox"
                          role="switch"
                          className="absolute w-4 h-4 appearance-none bg-gray-300 checked:bg-gray-900 cursor-pointer rounded-full"
                          onChange={handleTermsAgreement}
                          name="status"
                          id="status"
                          data-cy="terms-toggle" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSignup}
                    className="mt-4 p-2 bg-gray-900 text-gray-100 border-2 rounded-md"
                    data-cy="Signup-submit"
                  >
                    Sign up
                  </button>
                </form>
              </div>
            }
          </div>

          {isShowingRecovery ?
            <Modal>
              <UserPassword handleClose={() => setShowingRecovery(false)} userEmail="" />
            </Modal>
            :
            <></>}

          {log !== "" ?
            <div className="w-full mt-3 p-2 bg-amber-200">
              {log}
            </div>
            : <></>}

          {error !== "" ?
            <div className="w-full mt-3 p-2 bg-red-200">
              {error}
            </div>
            : <></>}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          <h1 data-cy="Success" className="text-3xl mt-8">
            Success!
          </h1>
          <h2 className="text-xl">Your account was created.</h2>
          <div>Please check your email address ({signupEmail}) to activate it.</div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
