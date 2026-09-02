import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import LoginForm from "./LoginForm"
import RegisterForm from "./RegisterForm"

const AuthTabs = () => {
  return (
    <Tabs defaultValue="login" className="w-[calc(100%-2rem)] max-w-100">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <LoginForm />
      </TabsContent>
      <TabsContent value="register">
        <RegisterForm />
      </TabsContent>
    </Tabs>
  )
}
export default AuthTabs
