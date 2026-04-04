import { motion } from 'framer-motion';
import { Wrench, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaintenancePageProps {
  message?: string;
  isAdmin?: boolean;
  onBypass?: () => void;
}

export default function MaintenancePage({ message, isAdmin, onBypass }: MaintenancePageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-lg w-full text-center space-y-6"
      >
        {/* Animated icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Wrench className="w-10 h-10 text-primary" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-h1-sb text-foreground">Under Maintenance</h1>
          <p className="text-body text-muted-foreground">
            {message || 'We\'re performing scheduled maintenance to improve your experience. Please check back shortly.'}
          </p>
        </div>

        {/* Animated progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-primary/60"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
            />
          ))}
        </div>

        {/* Admin bypass */}
        {isAdmin && onBypass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-4 border-t border-border"
          >
            <p className="text-small text-muted-foreground mb-3">
              You have admin access. You can bypass maintenance mode.
            </p>
            <Button onClick={onBypass} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Continue to Dashboard
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
