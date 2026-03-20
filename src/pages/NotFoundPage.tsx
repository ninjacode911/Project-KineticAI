import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground">
      <Activity className="h-12 w-12 text-muted-foreground" />
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
      </div>
      <Button onClick={() => navigate('/')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
    </div>
  );
}
