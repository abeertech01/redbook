import { useId, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AppDispatch, RootState } from "@/app/store"
import { loginUser, registerUser } from "@/app/thunks/auth"
import Logo from "@/components/Logo"
import ThemeToggle from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  userAddress: z.string().min(1, { message: "Enter your username or email." }),
  password: z.string().min(1, { message: "Enter your password." }),
})

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(60, "Name must not exceed 60 characters"),
    username: z
      .string()
      .min(2, "Username must be at least 2 characters long")
      .max(60, "Username must not exceed 60 characters"),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

// loginUser rejects with the server's message as its payload; registerUser
// throws, which unwrap() surfaces as a SerializedError.
const errorMessage = (error: unknown) =>
  typeof error === "string"
    ? error
    : ((error as { message?: string })?.message ?? "Something went wrong")

const inputClass =
  "h-11.5 w-full rounded-xl border border-line-2 bg-field px-3.5 text-[15px] text-ink outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,51,88,0.18)]"

type FieldProps = React.ComponentProps<"input"> & { label: string }

const Field = ({ label, ...props }: FieldProps) => (
  <label className="flex flex-col gap-1.75">
    <span className="text-[13px] font-medium text-ink-3">{label}</span>
    <input className={inputClass} {...props} />
  </label>
)

type PasswordFieldProps = FieldProps & {
  shown: boolean
  onToggle: () => void
}

// The Show/Hide button sits outside the <label> (linked by id instead), or
// its text would become part of the input's accessible name.
const PasswordField = ({ label, shown, onToggle, ...props }: PasswordFieldProps) => {
  const id = useId()

  return (
    <div className="flex flex-col gap-1.75">
      <label htmlFor={id} className="text-[13px] font-medium text-ink-3">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          className={cn(inputClass, "pr-16")}
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute top-1.5 right-1.5 h-8.5 cursor-pointer rounded-lg px-2.5 text-[12.5px] font-semibold text-mute hover:bg-hover-2 hover:text-ink"
        >
          {shown ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  )
}

const ErrorBox = ({ message }: { message?: string }) =>
  message ? (
    <div
      role="alert"
      className="rounded-[10px] border border-brand/25 bg-brand/8 px-3 py-2.5 text-[13.5px] text-accent-text-2"
    >
      {message}
    </div>
  ) : null

const SubmitButton = ({ children, disabled }: { children: string; disabled: boolean }) => (
  <button
    type="submit"
    disabled={disabled}
    className="mt-1 h-12 cursor-pointer rounded-xl bg-brand text-[15.5px] font-semibold text-white hover:bg-brand-hover disabled:cursor-default disabled:opacity-70"
  >
    {children}
  </button>
)

type FormProps = {
  showPw: boolean
  togglePw: () => void
}

const LoginForm = ({ showPw, togglePw }: FormProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const [serverError, setServerError] = useState("")
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { userAddress: "", password: "" },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (data: LoginValues) => {
    setServerError("")
    try {
      await dispatch(loginUser(data)).unwrap()
    } catch (error) {
      setServerError(errorMessage(error))
    }
  }

  const error =
    errors.userAddress?.message ?? errors.password?.message ?? serverError

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      onChange={() => setServerError("")}
      noValidate
      className="m-0 flex flex-col gap-4"
    >
      <Field
        label="Username or email"
        type="text"
        autoComplete="username"
        placeholder="you@example.com"
        {...form.register("userAddress")}
      />
      <PasswordField
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
        shown={showPw}
        onToggle={togglePw}
        {...form.register("password")}
      />
      <ErrorBox message={error} />
      <SubmitButton disabled={isSubmitting}>Log in</SubmitButton>
    </form>
  )
}

const RegisterForm = ({ showPw, togglePw }: FormProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const [serverError, setServerError] = useState("")
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = async (data: RegisterValues) => {
    setServerError("")
    try {
      await dispatch(registerUser(data)).unwrap()
    } catch (error) {
      setServerError(errorMessage(error))
    }
  }

  const error =
    errors.name?.message ??
    errors.username?.message ??
    errors.email?.message ??
    errors.password?.message ??
    errors.confirmPassword?.message ??
    serverError

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      onChange={() => setServerError("")}
      noValidate
      className="m-0 flex flex-col gap-4"
    >
      <Field
        label="Full name"
        type="text"
        autoComplete="name"
        placeholder="Jane Doe"
        {...form.register("name")}
      />
      <Field
        label="Username"
        type="text"
        autoComplete="username"
        placeholder="janedoe"
        {...form.register("username")}
      />
      <Field
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        {...form.register("email")}
      />
      <PasswordField
        label="Password"
        autoComplete="new-password"
        placeholder="8+ chars, mixed case, number & symbol"
        shown={showPw}
        onToggle={togglePw}
        {...form.register("password")}
      />
      <PasswordField
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        shown={showPw}
        onToggle={togglePw}
        {...form.register("confirmPassword")}
      />
      <ErrorBox message={error} />
      <SubmitButton disabled={isSubmitting}>Create account</SubmitButton>
    </form>
  )
}

const Login = () => {
  const { user } = useSelector((state: RootState) => state.user)
  const [mode, setMode] = useState<"login" | "register">("login")
  const [showPw, setShowPw] = useState(false)

  if (user) return <Navigate to={"/"} />

  const isLogin = mode === "login"
  const switchTo = (next: "login" | "register") => {
    setMode(next)
    setShowPw(false)
  }

  const tab = (active: boolean) =>
    cn(
      "h-9.5 flex-1 cursor-pointer rounded-full text-sm font-semibold",
      active ? "bg-bubble text-ink" : "text-mute"
    )

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,51,88,0.10),transparent_70%)] px-5 py-10">
      <div className="absolute top-3.5 right-3.5">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-105 flex-col items-center gap-7">
        <Logo size="lg" />
        <div className="flex w-full flex-col gap-5.5 rounded-[22px] border border-line bg-surface p-7 shadow-[0_30px_80px_var(--shade)]">
          <div
            role="tablist"
            className="flex rounded-full border border-line bg-field p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              onClick={() => switchTo("login")}
              className={tab(isLogin)}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              onClick={() => switchTo("register")}
              className={tab(!isLogin)}
            >
              Create account
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold tracking-[-0.02em]">
              {isLogin ? "Welcome back" : "Join RedBook"}
            </div>
            <div className="text-[14.5px] text-mute">
              {isLogin
                ? "Log in to pick up where you left off."
                : "It only takes a minute."}
            </div>
          </div>
          {isLogin ? (
            <LoginForm showPw={showPw} togglePw={() => setShowPw((s) => !s)} />
          ) : (
            <RegisterForm showPw={showPw} togglePw={() => setShowPw((s) => !s)} />
          )}
        </div>
        <div className="text-sm text-mute">
          {isLogin ? "New to RedBook?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => switchTo(isLogin ? "register" : "login")}
            className="cursor-pointer font-semibold text-accent-text hover:text-accent-text-2"
          >
            {isLogin ? "Create an account" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  )
}
export default Login
