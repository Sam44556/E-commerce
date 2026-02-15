import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MoveLeft, Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl border-0">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
            <Ghost className="w-12 h-12 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you are looking for seems to have vanished into thin air.
          </p>
        </div>

        <Link to="/">
          <Button size="lg" className="w-full">
            <MoveLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}