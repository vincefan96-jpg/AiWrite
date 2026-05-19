import AuthLayout from "../components/Auth/AuthLayout";
import LoginForm from "../components/Auth/LoginForm";

export default function Login() {
  return (
    <AuthLayout title="登录 AI Write">
      <LoginForm />
    </AuthLayout>
  );
}
