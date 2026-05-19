import AuthLayout from "../components/Auth/AuthLayout";
import RegisterForm from "../components/Auth/RegisterForm";

export default function Register() {
  return (
    <AuthLayout title="创建账号">
      <RegisterForm />
    </AuthLayout>
  );
}
