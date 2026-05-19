interface Props {
  title: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-8 py-10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h1>
        {children}
      </div>
    </div>
  );
}
