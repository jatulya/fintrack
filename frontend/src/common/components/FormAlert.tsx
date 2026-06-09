interface FormAlertProps {
  message: string;
}

export function FormAlert({ message }: FormAlertProps) {
  return (
    <div role="alert" className="form-alert">
      {message}
    </div>
  );
}
