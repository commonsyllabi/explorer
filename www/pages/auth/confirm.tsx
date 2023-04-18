import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = context.query.token as string;
  const url = new URL(`auth/confirm?token=${token}`, apiUrl);
  let log = "";
  let success = false

  if (token != undefined) {
    log = `That's at least a valid token; we're checking it...`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: token }),
    });

    if (res.status === 200) {
      log = `Your account is confirmed!`;
      success = true
    } else {
      const body = await res.text();
      log = `There was a problem verifying your account (${body})`;
    }
  } else {
    log = `Oops! Looks like the token you're using to confirm this account is invalid.`;
  }

  return {
    props: {
      token: token,
      log: log,

    },
  };
};

interface IConfirmProps {
  token: string;
  log: string;
  success: boolean;
}

const Confirm: NextPage<IConfirmProps> = (props) => {
  return (

    <div className="flex flex-col gap-5 w-11/12 md:w-4/12 m-auto mt-8">
      <h2 className="text-2xl">Confirm your account</h2>
      <div>{props.log}</div>
      {props.success ?
        <div>You can now <Link href="/auth/signin" className="underline">log in</Link>.</div> : <></>}
    </div>

  );
};

export default Confirm;
