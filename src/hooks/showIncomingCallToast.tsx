import { toast } from '@/hooks/use-toast';
import { Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IncomingCallToastProps {
  fromUser: string;
  onAccept: () => void;
  onDecline: () => void;
  ringDurationMs?: number;
}

export function showIncomingCallToast({
  fromUser,
  onAccept,
  onDecline,
  ringDurationMs = 15000, // default 5 seconds
}: IncomingCallToastProps) {
  let audio: HTMLAudioElement | null = null;
  let timeout: NodeJS.Timeout;

  const playRingtone = () => {
    audio = new Audio('/ringtone.wav');
    audio.loop = true;
    audio.play();
    timeout = setTimeout(() => {
      stopRingtone();
    }, ringDurationMs);
  };
  const stopRingtone = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
    if (timeout) clearTimeout(timeout);
  };

  const toastId = toast({
    title: 'Incoming Call',
    description: (
      <div className="flex flex-col items-center gap-2">
        <span className="font-semibold text-lg">{fromUser} is calling…</span>
        <div className="flex gap-3 mt-2">
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            onClick={() => {
              stopRingtone();
              toastId.dismiss();
              onAccept();
            }}
          >
            <Phone className="w-4 h-4" /> Accept
          </Button>
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={() => {
              stopRingtone();
              toastId.dismiss();
              onDecline();
            }}
          >
            <PhoneOff className="w-4 h-4" /> Decline
          </Button>
        </div>
      </div>
    ),
    duration: ringDurationMs + 2000, // toast stays a bit longer than ring
    onOpenChange: (open) => {
      if (open) playRingtone();
      else stopRingtone();
    },
  });
}
