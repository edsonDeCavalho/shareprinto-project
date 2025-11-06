
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, KeyRound } from "lucide-react"
import Link from 'next/link'
import { Separator } from "@/components/ui/separator"

export default function CreatorSignInPage() {
  return (
    <div className="flex-grow flex items-center justify-center bg-grid p-4">
      <Card className="w-full max-w-sm mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Creator Sign In</CardTitle>
          <CardDescription>Sign in with your phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="e.g. (123) 456-7890" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
               <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="code" type="text" placeholder="Enter the code sent to your phone" className="pl-10" />
              </div>
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
            <Button variant="link" size="sm" className="w-full">
              Didn't receive a code? Resend
            </Button>
          </form>

            <Separator className="my-6" />
            
            <div className="text-center">
                 <p className="text-sm text-muted-foreground">Want to share your printer instead?</p>
                 <Button variant="outline" className="w-full mt-2" asChild>
                    <Link href="/farmer-signup">
                        Become a Farmer
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
