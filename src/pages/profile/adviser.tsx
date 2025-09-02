import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdviserProfilePage = () => {
  return (
    <Card className="mx-auto max-w-3xl rounded-2xl border p-6 shadow-sm">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>
          Update your personal information and settings
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" onChange={() => console.log("First Name")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" onChange={() => console.log("Last Name")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" onChange={() => console.log("Email")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" onChange={() => console.log("Phone #")} />
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit">Save Changes</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
export default AdviserProfilePage;
