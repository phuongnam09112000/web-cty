export interface FormData {
    lastName: string;
    firstName: string;
    email: string;
    message: string;
  }
  
  export interface ContactFormProps {
    onSubmit: (data: FormData) => void;
  }
  