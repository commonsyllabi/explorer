import { useState } from "react";

interface IPasswordReset {
  userEmail: string,
  handleClose: Function
}

const UserPassword: React.FunctionComponent<IPasswordReset> = ({ userEmail, handleClose }) => {
  const [success, setSuccess] = useState(false);
  const [log, setLog] = useState('')
  const [recoverEmail, setRecoverEmail] = useState(userEmail);

  const handleEmailChange = (e: React.BaseSyntheticEvent) => {
    const v = e.target.value as string;
    setRecoverEmail(v);
  };

  const handleRecover = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const b = new FormData()
    b.append("email", recoverEmail)

    const url = new URL(`/auth/request-recover`, process.env.NEXT_PUBLIC_API_URL)
    fetch(url, { method: 'POST', body: b })
      .then(res => {
        if (res.ok) {
          setSuccess(true)
          return;
        }
        else
          return res.text()
      })
      .then(body => {
        setLog(`Something went wrong: ${body}`)
      })
  };

  const recoveryForm = (
    <form
      className=""
      onSubmit={handleRecover}
    >
      <div className="">
        <h2 className="font-bold">Password recovery</h2>
        <div className="text-sm">Enter your email address below, and we will send you a link to reset your password:</div>
        <div className="">
          <input
            onChange={handleEmailChange}
            defaultValue={recoverEmail}
            className="bg-transparent mt-2 py-1 border-b-2 border-b-gray-900"
            type="text"
          />
        </div>
      </div>
      <div
        className=""
      >
        <div className="">
          <button
            className="w-full border border-gray-900 rounded-lg my-2"
            type="submit"
            onClick={handleRecover}
          >
            Reset my password
          </button>
        </div>
      </div>
    </form>
  );

  const successMessage = (
    <>
      <div className="w-full text-center">
        <p>An email was sent to {recoverEmail}</p>
      </div>
    </>
  );

  return (
    <div className="">
      <div className="">
        {!success ? (
          recoveryForm
        ) : (
          successMessage
        )}
      </div>
      <div>{log}</div>
      <button onClick={() => handleClose()} className="w-full border border-gray-900 rounded-lg">Close</button>
    </div>
  );
};

export default UserPassword;
