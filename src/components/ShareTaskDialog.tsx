
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Share2, X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  currentShares: string[];
  onShare: (emails: string[]) => void;
}

const ShareTaskDialog = ({ 
  isOpen, 
  onClose, 
  taskTitle, 
  currentShares, 
  onShare 
}: ShareTaskDialogProps) => {
  const [emailInput, setEmailInput] = useState('');
  const [sharedEmails, setSharedEmails] = useState<string[]>(currentShares);

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (sharedEmails.includes(email)) {
      toast({
        title: "Email Already Added",
        description: "This email is already in the share list.",
        variant: "destructive",
      });
      return;
    }

    setSharedEmails([...sharedEmails, email]);
    setEmailInput('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setSharedEmails(sharedEmails.filter(email => email !== emailToRemove));
  };

  const handleShare = () => {
    onShare(sharedEmails);
    toast({
      title: "Task Shared Successfully",
      description: `"${taskTitle}" has been shared with ${sharedEmails.length} ${sharedEmails.length === 1 ? 'person' : 'people'}.`,
    });
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddEmail();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            <span>Share Task</span>
          </DialogTitle>
          <DialogDescription>
            Share "{taskTitle}" with others. They'll be able to view and collaborate on this task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Add collaborator by email</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email address..."
                className="bg-white flex-1"
              />
              <Button 
                onClick={handleAddEmail}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {sharedEmails.length > 0 && (
            <div className="space-y-2">
              <Label>Shared with:</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {sharedEmails.map((email, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-1 bg-blue-100 text-blue-800"
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Shared users will receive an email notification and can view, edit, and mark this task as complete.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleShare}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={sharedEmails.length === 0}
          >
            Share Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareTaskDialog;
