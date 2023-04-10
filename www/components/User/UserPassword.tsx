interface IUserPasswordProps {
    apiUrl: string,
  }
  
  //-- todo this should be the recover function
  const UserPassword: React.FunctionComponent<IUserPasswordProps> = ({ apiUrl }) => {
    return(<>
    <button>Recover Password</button>
    </>)
  }

  export default UserPassword;