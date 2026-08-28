import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { useTheme } from "@/constants/ThemeProvider"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "hsl(var(--primary))",
          "--normal-text": "hsl(var(--primary-foreground))",
          "--normal-border": "hsl(var(--primary))",
          "--success-bg": "#059669",
          "--success-text": "#ffffff",
          "--success-border": "#059669",
          "--error-bg": "hsl(var(--destructive))",
          "--error-text": "hsl(var(--destructive-foreground))",
          "--error-border": "hsl(var(--destructive))",
          "--warning-bg": "#d97706",
          "--warning-text": "#ffffff",
          "--warning-border": "#d97706",
          "--info-bg": "#0284c7",
          "--info-text": "#ffffff",
          "--info-border": "#0284c7",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
