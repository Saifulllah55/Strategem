import AuthForm from "../components/AuthForm";

const LoginPage = ({ signUp }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-950">
      <AuthForm signUp={signUp}></AuthForm>
    </div>
  );
};

export default LoginPage;
