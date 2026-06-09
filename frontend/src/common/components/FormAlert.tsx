interface FormAlertProps {
  message: string;
}

export function FormAlert({ message }: FormAlertProps) {
  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5"
    >
      {message}
    </div>
  );
}
