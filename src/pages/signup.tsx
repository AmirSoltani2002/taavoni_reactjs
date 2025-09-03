import { StepBack } from "lucide-react"
import { project_name } from "../config"
import { SignupForm } from "../components/logins/signin-form"

export const Signup: React.FC = () => {

  return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-[url('/home/amirabbas/Documents/personal/work/taavoni/project/src/assets/ut.jpg')] bg-center bg-contain md:bg-cover">
        <div className="flex w-full max-w-sm flex-col gap-6">
            <a href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md -mb-5">
                <StepBack className="size-4" />
            </div>
            <span className="text-sm font-medium bg-white rounded-sm -mb-5">{project_name}</span>
            </a>
            <div className="left">
                <SignupForm />
            </div>
        </div>
      </div>
  )
}



